import type { CustomFilterModel, CustomSortingModel } from './components/datagrid/CustomColumnMenu';
import type { Dispatch, SetStateAction } from 'react';
import type { FilterStatus } from './components/datagrid/CustomFilterMenu';

declare module '@mui/x-data-grid' {
  interface ColumnMenuPropsOverrides {
    parentFilterModel: CustomFilterModel;
    parentSortingModel: CustomSortingModel;
    setParentFilterModel: Dispatch<SetStateAction<CustomFilterModel>>;
    setParentSortingModel: Dispatch<SetStateAction<CustomSortingModel>>;
    setFilterStatus: Dispatch<SetStateAction<FilterStatus>>;
  }
}