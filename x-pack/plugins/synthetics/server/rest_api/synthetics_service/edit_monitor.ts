/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { SavedObjectsUpdateResponse, SavedObject } from '@kbn/core/server';
import { SavedObjectsErrorHelpers } from '@kbn/core/server';
import {
  MonitorFields,
  EncryptedSyntheticsMonitor,
  SyntheticsMonitorWithSecrets,
  SyntheticsMonitor,
  ConfigKey,
} from '../../../common/runtime_types';
import { UMRestApiRouteFactory } from '../types';
import { API_URLS } from '../../../common/constants';
import {
  syntheticsMonitorType,
  syntheticsMonitor,
} from '../../lib/saved_objects/synthetics_monitor';
import { validateMonitor } from './monitor_validation';
import { getMonitorNotFoundResponse } from './service_errors';
import {
  sendTelemetryEvents,
  formatTelemetryUpdateEvent,
} from './telemetry/monitor_upgrade_sender';
import { formatSecrets, normalizeSecrets } from '../../lib/synthetics_service/utils/secrets';

// Simplify return promise type and type it with runtime_types
export const editSyntheticsMonitorRoute: UMRestApiRouteFactory = () => ({
  method: 'PUT',
  path: API_URLS.SYNTHETICS_MONITORS + '/{monitorId}',
  validate: {
    params: schema.object({
      monitorId: schema.string(),
    }),
    body: schema.any(),
  },
  handler: async ({
    request,
    response,
    savedObjectsClient,
    server: { encryptedSavedObjects, syntheticsService, logger, telemetry, kibanaVersion },
  }): Promise<any> => {
    const encryptedSavedObjectsClient = encryptedSavedObjects.getClient();
    const monitor = request.body as SyntheticsMonitor;
    const { monitorId } = request.params;

    try {
      const previousMonitor: SavedObject<EncryptedSyntheticsMonitor> = await savedObjectsClient.get(
        syntheticsMonitorType,
        monitorId
      );

      /* Decrypting the previous monitor before editing ensures that all existing fields remain
       * on the object, even in flows where decryption does not take place, such as the enabled tab
       * on the monitor list table. We do not decrypt monitors in bulk for the monitor list table */
      const decryptedPreviousMonitor =
        await encryptedSavedObjectsClient.getDecryptedAsInternalUser<SyntheticsMonitorWithSecrets>(
          syntheticsMonitor.name,
          monitorId,
          {
            namespace: previousMonitor.namespaces?.[0],
          }
        );

      const editedMonitor = {
        ...normalizeSecrets(decryptedPreviousMonitor).attributes,
        ...monitor,
      };

      const validationResult = validateMonitor(editedMonitor as MonitorFields);

      if (!validationResult.valid) {
        const { reason: message, details, payload } = validationResult;
        return response.badRequest({ body: { message, attributes: { details, ...payload } } });
      }

      const monitorWithRevision = {
        ...editedMonitor,
        revision: (previousMonitor.attributes[ConfigKey.REVISION] || 0) + 1,
      };
      const formattedMonitor = formatSecrets(monitorWithRevision);

      const updatedMonitor: SavedObjectsUpdateResponse<EncryptedSyntheticsMonitor> =
        await savedObjectsClient.update<MonitorFields>(
          syntheticsMonitorType,
          monitorId,
          monitor.type === 'browser' ? { ...formattedMonitor, urls: '' } : formattedMonitor
        );

      const errors = await syntheticsService.pushConfigs([
        {
          ...editedMonitor,
          id: updatedMonitor.id,
          fields: {
            config_id: updatedMonitor.id,
          },
          fields_under_root: true,
        },
      ]);

      sendTelemetryEvents(
        logger,
        telemetry,
        formatTelemetryUpdateEvent(
          updatedMonitor,
          previousMonitor,
          kibanaVersion,
          Boolean((monitor as MonitorFields)[ConfigKey.SOURCE_INLINE]),
          errors
        )
      );

      // Return service sync errors in OK response
      if (errors && errors.length > 0) {
        return response.ok({
          body: { message: 'error pushing monitor to the service', attributes: { errors } },
        });
      }

      return updatedMonitor;
    } catch (updateErr) {
      if (SavedObjectsErrorHelpers.isNotFoundError(updateErr)) {
        return getMonitorNotFoundResponse(response, monitorId);
      }
      logger.error(updateErr);

      throw updateErr;
    }
  },
});
