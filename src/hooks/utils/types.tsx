// // types.ts

// // Define the interfaces based on your data
// export interface FieldInfo {
//   field_path: string;
//   data_type: string;
//   description: string | null;
//   collation_name: string | null;
//   rounding_mode: string | null;
//   is_primary_key: boolean;   // New Field
//   is_foreign_key: boolean;   // New Field
// }

// export interface TableInfo {
//   table_id: string;
//   fields: FieldInfo[];
// }

// export interface DatasetInfo {
//   dataset_id: string;
//   tables: TableInfo[];
// }

// export interface ProjectInfo {
//   project_id: string;
//   datasets: DatasetInfo[];
// }

// export interface FlattenedField {
//   project_id: string;
//   dataset_id: string;
//   table_id: string;
//   original_table_id: string;
//   column_name: string;
//   field_description: string | null;
//   data_type: string;
//   is_primary_key: boolean;
//   is_foreign_key: boolean;

//   // Updated fields (all as optional)
//   updated_project_id?: string;
//   updated_dataset_id?: string;
//   updated_table_id?: string;
//   updated_original_table_id?: string;
//   updated_column_name?: string;
//   updated_field_description?: string | null;
//   updated_data_type?: string;
//   updated_is_primary_key?: boolean;
//   updated_is_foreign_key?: boolean;
// }
export interface FlattenedField {
  table_catalog: string; // was project_id
  table_schema: string;  // was dataset_id
  table_name: string;    // was table_id
  column_name: string;   // was column_name
  field_path: string;    // optional
  data_type: string;
  description: string | null;
  collation_name: string | null;
  rounding_mode: string | null;
  primary_key: boolean;
  foreign_key: boolean;
  field_mode:string;
  access_instructions?: {
    from_clause: string;
    select_expr: string;
  };
}
