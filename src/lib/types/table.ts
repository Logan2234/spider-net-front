interface TableProps {
  cols: IColumn[];
  selectable?: boolean;
  noDataRender?: (() => string) | string;
  loadingRender?: (() => string) | string;
  repeatHeaderInFooter?: boolean;
  stickyHeader?: boolean;
  stickFirstColumn?: boolean;
  withGlobalSearch?: boolean;
  tableName?: string;
  infiniteScroll?: boolean;
  onDoubleClick?: (item: unknown) => void;
  onLoad: TableOnLoadFunction;
}

interface IColumn {
  name: string;
  label?: string;
  hidden?: boolean;
  sortable?: boolean;
  resizable?: boolean;
  minWidth?: string;
  maxWidth?: string;
  command?: boolean;
  render?: (data: unknown, index: number) => string;
}
interface IColumnSetting {
  name: string;
  hidden?: boolean;
}

type TableOnLoadFunction = (
  page: number,
  pageSize: number,
  sort: { by: string; dir: 0 | 1 | -1 } | null,
  search: string | null,
  filter: unknown | null
) => Promise<{ results: unknown[]; count: number }>;

export type { IColumn, IColumnSetting, TableOnLoadFunction, TableProps };
