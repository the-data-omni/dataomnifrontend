// example-schema.ts (or keep it in the same file if you prefer)

export const EXAMPLE_SCHEMA = {
    schema: [
      {
        "collation_name": "NULL",
        "column_name": "order_id",
        "data_type": "STRING",
        "description": "The unique identifier of the order.",
        "field_path": "order_id",
        "foreign_key": false,
        "primary_key": false,
        "rounding_mode": null,
        "table_catalog": "foreign-connect-48db5",
        "table_name": "recharge__billing_history",
        "table_schema": "RECHARGE"
      },
      {
        "collation_name": "NULL",
        "column_name": "orders_count",
        "data_type": "STRING",
        "description": "The number of orders generated from this charge (Will be >1 for prepaid).",
        "field_path": "orders_count",
        "foreign_key": false,
        "primary_key": false,
        "rounding_mode": null,
        "table_catalog": "foreign-connect-48db5",
        "table_name": "recharge__billing_history",
        "table_schema": "RECHARGE"
      }
    ]
  };
  