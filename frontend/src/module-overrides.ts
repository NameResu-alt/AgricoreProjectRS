import type { CustomSortingModel } from './components/datagrid/CustomColumnMenu';
import type { Dispatch, SetStateAction } from 'react';
import type { CustomFilterModel } from './components/datagrid/CustomFilterMenuV2';

declare module '@mui/x-data-grid' {
  interface ColumnMenuPropsOverrides {
    parentFilterModel: CustomFilterModel
    setFilterModel: React.Dispatch<React.SetStateAction<CustomFilterModel>>;
    parentSortingModel: CustomSortingModel;
    setParentSortingModel: Dispatch<SetStateAction<CustomSortingModel>>;
  }
}