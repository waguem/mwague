import { type MRT_RowData, type MRT_TableOptions } from "mantine-react-table";

//define re-useable default table options for all tables in your app
export const getDefaultMRTOptions = <TData extends MRT_RowData>(): Partial<MRT_TableOptions<TData>> => ({
  enableEditing: true,
  positionActionsColumn: "last",
  paginationDisplayMode: "pages",
  initialState: {
    density: "xs",
    showColumnFilters: false,
  },
  //list all of your default table options here
});
