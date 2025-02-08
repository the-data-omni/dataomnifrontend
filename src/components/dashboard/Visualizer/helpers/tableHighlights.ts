// tableHighlights.ts

// We'll define `highlights` in the module scope, but only populate it if we're in the browser
let highlights: Record<string, string[]> = {};

// Check if we're in the browser
if (typeof window !== "undefined") {
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  highlights = (urlParams.get("highlights") || "")
    .split(";")
    .reduce((acc: { [key: string]: string[] }, section: string) => {
      const [tableName, fields] = section.split(":");

      if (tableName && fields) {
        acc[tableName] = fields.split(",");
      }

      return acc;
    }, {});
}

export const tableHighlightsPresent = () => {
  return Object.keys(highlights).length > 0;
};

export const isTableHighlighted = ({
  schema,
  tableName,
}: {
  schema: string | undefined;
  tableName: string;
}) => {
  const fullTableName = schema ? `${schema}.${tableName}` : tableName;
  return highlights.hasOwnProperty(fullTableName);
};

export const isColumnHighlighted = ({
  schema,
  tableName,
  columnName,
}: {
  schema: string | undefined;
  tableName: string;
  columnName: string;
}) => {
  const fullTableName = schema ? `${schema}.${tableName}` : tableName;
  return highlights[fullTableName]?.includes(columnName);
};
