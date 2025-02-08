import { TableConfig } from "@/components/dashboard/Visualizer/types";

import transactionsTable from "./tables/transactions.json";
import vendorsTable from "./tables/vendors.json";

const tables: TableConfig[] = [
  transactionsTable,
  vendorsTable
];

export default tables;
