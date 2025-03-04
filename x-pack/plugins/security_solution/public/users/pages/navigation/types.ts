/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { DocValueFields } from '@kbn/timelines-plugin/common';
import { UsersTableType, UsersType } from '../../store/model';
import { GlobalTimeArgs } from '../../../common/containers/use_global_time';
import { ESTermQuery } from '../../../../common/typed_json';
import { NavTab } from '../../../common/components/navigation/types';

type KeyUsersNavTabWithoutMlPermission = UsersTableType.allUsers &
  UsersTableType.risk &
  UsersTableType.events &
  UsersTableType.alerts;

type KeyUsersNavTabWithMlPermission = KeyUsersNavTabWithoutMlPermission & UsersTableType.anomalies;

type KeyUsersNavTab = KeyUsersNavTabWithoutMlPermission | KeyUsersNavTabWithMlPermission;

export type UsersNavTab = Record<KeyUsersNavTab, NavTab>;
export interface QueryTabBodyProps {
  type: UsersType;
  startDate: GlobalTimeArgs['from'];
  endDate: GlobalTimeArgs['to'];
  filterQuery?: string | ESTermQuery;
}

export type UsersComponentsQueryProps = QueryTabBodyProps & {
  deleteQuery?: GlobalTimeArgs['deleteQuery'];
  docValueFields?: DocValueFields[];
  indexNames: string[];
  skip: boolean;
  setQuery: GlobalTimeArgs['setQuery'];
};
