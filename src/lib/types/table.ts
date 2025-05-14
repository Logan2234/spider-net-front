export interface IColumn {
  name: string;
  label: string;
  hidden?: boolean;
  sortable?: boolean;
  resizable?: boolean;
  minWidth?: string;
  maxWidth?: string;
  render?: (data: unknown, index: number) => string;
}

export interface IColumnSetting {
  name: string;
  hidden?: boolean;
}

export type TableOnLoadFunction = (
  page: number,
  pageSize: number,
  sort: { by: string; dir: 0 | 1 | -1 } | null,
  search: string | null,
  filter: unknown | null
) => Promise<{ results: unknown[]; count: number }>;
