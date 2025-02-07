"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { PencilSimple as PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useNavigate } from "react-router-dom";

import { paths } from "@/paths";
import { dayjs } from "@/lib/dayjs";
import type { ColumnDef } from "@/components/core/data-table";
import { DataTable } from "@/components/core/data-table";
import { RouterLink } from "@/components/core/link";
import { PropertyItem } from "@/components/core/property-item";
import { PropertyList } from "@/components/core/property-list";
import { ClockIcon } from "@mui/x-date-pickers/icons";

// If you are passing a "Query" object with `.sql`, you might import it here.
// interface Query { ... sql?: string; ... }

interface Image {
  id: string;
  url: string;
  fileName: string;
  primary?: boolean;
}

const imageColumns: ColumnDef<Image>[] = [
  {
    formatter: (row) => (
      <Box
        sx={{
          backgroundImage: `url(${row.url})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          bgcolor: "var(--mui-palette-background-level2)",
          borderRadius: 1,
          flex: "0 0 auto",
          height: "40px",
          width: "40px",
        }}
      />
    ),
    name: "Image",
    width: "100px",
  },
  { field: "fileName", name: "File name", width: "300px" },
  {
    formatter: (row) => (
      row.primary ? <Chip color="secondary" label="Primary" size="small" variant="soft" /> : <span />
    ),
    name: "Actions",
    hideName: true,
    width: "100px",
    align: "right",
  },
];

// Example placeholder images
const images: Image[] = [
  { id: "IMG-001", url: "/assets/product-1.png", fileName: "product-1.png", primary: true },
];

export interface ProductModalProps {
  open: boolean;
  /** The entire query object, or a partial. Must have .sql if you want the snippet. */
  query?: {
    id?: string;
    question?: string;
    category?: string;
    status?: "draft" | "published";
    createdAt?: Date;
    sql?: string;
  };
}

/**
 * A modal showing product/query details.
 * - Removed the Stock & inventory section
 * - Moved the SQL snippet to the “Images” area, with a "Do Something" button.
 */
export function QueryModal({ open, query }: ProductModalProps): React.JSX.Element | null {
  const navigate = useNavigate();

  const handleClose = React.useCallback(() => {
    navigate(paths.dashboard.products.list);
  }, [navigate]);

  // Fallback data if `query` is undefined
  const productId = query?.id || "PRD-001";
  const question = query?.question || "Unknown question";
  const category = query?.category || "Unknown category";
  const status = query?.status === "published" ? "Published" : "Draft";
  const createdAt = query?.createdAt ? dayjs(query.createdAt).format("MMMM D, YYYY hh:mm A") : "N/A";

  return (
    <Dialog
      maxWidth="sm"
      onClose={handleClose}
      open={open}
      sx={{
        "& .MuiDialog-container": { justifyContent: "flex-end" },
        "& .MuiDialog-paper": { height: "100%", width: "100%" },
      }}
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
        {/* Header row */}
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h6">{productId}</Typography>
          <IconButton onClick={handleClose}>
            <XIcon />
          </IconButton>
        </Stack>

        <Stack spacing={3} sx={{ flex: "1 1 auto", overflowY: "auto" }}>
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={3}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="h6">Details</Typography>
              <Button
                color="secondary"
                component={RouterLink}
                href={paths.dashboard.products.details("1")}
                startIcon={<PencilSimpleIcon />}
              >
                Edit
              </Button>
            </Stack>

            {/* “Details” property list => we remove the "SQL Query" here */}
            <Card sx={{ borderRadius: 1 }} variant="outlined">
              <PropertyList divider={<Divider />} sx={{ "--PropertyItem-padding": "12px 24px" }}>
                {(
                  [
                    { key: "Question", value: question },
                    { key: "Category", value: category },
                    {
                      key: "Created at",
                      value: createdAt,
                    },
                    {
                      key: "Status",
                      value: (
                        <Chip
                          icon={
                            status === "Published" ? (
                              <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />
                            ) : (
                              <ClockIcon  />
                            )
                          }
                          label={status}
                          size="small"
                          variant="outlined"
                        />
                      ),
                    },
                  ] satisfies { key: string; value: React.ReactNode }[]
                ).map((item) => (
                  <PropertyItem key={item.key} name={item.key} value={item.value} />
                ))}
              </PropertyList>
            </Card>

            {/* “Images” section => show images AND the SQL snippet with a button */}
            <Stack spacing={3}>
              <Typography variant="h6">Full Query</Typography>
              <Card sx={{ borderRadius: 1 }} variant="outlined">
                {/* <Box sx={{ overflowX: "auto" }}>
                  <DataTable<Image> columns={imageColumns} rows={images} />
                </Box> */}

                {/* Right below the images table, we show the SQL snippet + button */}
                {query?.sql && (
                  <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    {/* <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      SQL Query
                    </Typography> */}

                    <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1, mb: 2 }}>
                      <pre style={{ margin: 0 }}>{query.sql}</pre>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => {
                        alert(`Do something with this query: ${query.sql}`);
                      }}
                    >
                      Do Something
                    </Button>
                  </Box>
                )}
              </Card>
            </Stack>

            {/* Stock & inventory section => REMOVED */}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
