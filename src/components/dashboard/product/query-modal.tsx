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
import { RouterLink } from "@/components/core/link";
import { PropertyItem } from "@/components/core/property-item";
import { PropertyList } from "@/components/core/property-list";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";

/** Reuse your "Query" interface, but mark fields optional. */
interface Query {
  id?: string;
  question?: string;
  category?: string;
  /** Replaced `status` with `count` */
  count?: number;
  createdAt?: Date;
  sql?: string;
}

export interface ProductModalProps {
  open: boolean;
  query?: Query;
}

export function QueryModal({ open, query }: ProductModalProps): React.JSX.Element | null {
  const navigate = useNavigate();

  const handleClose = React.useCallback(() => {
    navigate(paths.dashboard.products.list);
  }, [navigate]);

  // Fallback data
  const productId = query?.id || "NO-ID";
  const question = query?.question || "Unknown question";
  const category = query?.category || "Unknown category";
  const count = query?.count ?? 0; // fallback numeric value
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
                      key: "Count",
                      value: (
                        <Chip
                          icon={<CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />}
                          label={count}
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

            <Stack spacing={3}>
              <Typography variant="h6">Full Query</Typography>
              <Card sx={{ borderRadius: 1 }} variant="outlined">
                {query?.sql && (
                  <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
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
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
