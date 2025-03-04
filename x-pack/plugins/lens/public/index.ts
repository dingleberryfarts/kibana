/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { LensPlugin } from './plugin';

export type {
  EmbeddableComponentProps,
  TypedLensByValueInput,
} from './embeddable/embeddable_component';
export type {
  XYState,
  XYReferenceLineLayerConfig,
  XYLayerConfig,
  ValidLayer,
  XYDataLayerConfig,
  XYAnnotationLayerConfig,
} from './xy_visualization/types';
export type {
  DatasourcePublicAPI,
  DataType,
  OperationMetadata,
  SuggestionRequest,
  TableSuggestion,
  Visualization,
  VisualizationSuggestion,
} from './types';
export type {
  ValueLabelConfig,
  PieVisualizationState,
  PieLayerState,
  SharedPieLayerState,
} from '../common/types';

export type { DatatableVisualizationState } from './datatable_visualization/visualization';
export type { HeatmapVisualizationState } from './heatmap_visualization/types';
export type { GaugeVisualizationState } from './visualizations/gauge/constants';
export type {
  IndexPatternPersistedState,
  PersistedIndexPatternLayer,
  OperationType,
  IncompleteColumn,
  GenericIndexPatternColumn,
  FieldBasedIndexPatternColumn,
  FiltersIndexPatternColumn,
  RangeIndexPatternColumn,
  TermsIndexPatternColumn,
  DateHistogramIndexPatternColumn,
  MinIndexPatternColumn,
  MaxIndexPatternColumn,
  AvgIndexPatternColumn,
  CardinalityIndexPatternColumn,
  SumIndexPatternColumn,
  MedianIndexPatternColumn,
  PercentileIndexPatternColumn,
  CountIndexPatternColumn,
  LastValueIndexPatternColumn,
  CumulativeSumIndexPatternColumn,
  CounterRateIndexPatternColumn,
  DerivativeIndexPatternColumn,
  MovingAverageIndexPatternColumn,
  FormulaIndexPatternColumn,
  MathIndexPatternColumn,
  OverallSumIndexPatternColumn,
  FormulaPublicApi,
  StaticValueIndexPatternColumn,
  TimeScaleIndexPatternColumn,
} from './indexpattern_datasource/types';
export type {
  XYArgs,
  ExtendedYConfig,
  XYRender,
  LayerType,
  YAxisMode,
  LineStyle,
  FillStyle,
  SeriesType,
  YScaleType,
  XScaleType,
  AxisConfig,
  XYCurveType,
  XYChartProps,
  LegendConfig,
  IconPosition,
  ExtendedYConfigResult,
  DataLayerArgs,
  ValueLabelMode,
  AxisExtentMode,
  DataLayerConfig,
  FittingFunction,
  AxisExtentConfig,
  LegendConfigResult,
  AxesSettingsConfig,
  GridlinesConfigResult,
  TickLabelsConfigResult,
  AxisExtentConfigResult,
  ReferenceLineLayerArgs,
  LabelsOrientationConfig,
  ReferenceLineLayerConfig,
  LabelsOrientationConfigResult,
  AxisTitlesVisibilityConfigResult,
} from '@kbn/expression-xy-plugin/common';
export type { LensEmbeddableInput } from './embeddable';
export { layerTypes } from '../common';

export type { LensPublicStart, LensPublicSetup } from './plugin';

export const plugin = () => new LensPlugin();
