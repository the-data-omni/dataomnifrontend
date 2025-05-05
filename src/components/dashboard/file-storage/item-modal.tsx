// "use client";

// import * as React from "react";
// import Avatar from "@mui/material/Avatar";
// import AvatarGroup from "@mui/material/AvatarGroup";
// import Box from "@mui/material/Box";
// import Chip from "@mui/material/Chip";
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import Grid from "@mui/material/Grid2";
// import IconButton from "@mui/material/IconButton";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import Stack from "@mui/material/Stack";
// import Tooltip from "@mui/material/Tooltip";
// import Typography from "@mui/material/Typography";
// import { Globe as GlobeIcon } from "@phosphor-icons/react/dist/ssr/Globe";
// import { PencilSimple as PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
// import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
// import { Star as StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
// import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
// import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";

// import { dayjs } from "@/lib/dayjs";
// import { usePopover } from "@/hooks/use-popover";

// import { ItemIcon } from "./item-icon";
// import type { Item } from "./types";

// const tagOptions = ["Personal", "Work", "Business", "Accounting", "Security", "Design"] satisfies string[];

// export interface ItemModalProps {
// 	item: Item;
// 	onClose?: () => void;
// 	onDelete?: (itemId: string) => void;
// 	onFavorite?: (itemId: string, value: boolean) => void;
// 	open?: boolean;
// }

// export function ItemModal({ item, onClose, onDelete, onFavorite, open = false }: ItemModalProps): React.JSX.Element {
// 	const tagsPopover = usePopover<HTMLButtonElement>();

// 	const tags = item.tags ?? [];
// 	const sharedWith = item.shared ?? [];
// 	const showShared = !item.isPublic && sharedWith.length > 0;

// 	return (
// 		<React.Fragment>
// 			<Dialog
// 				maxWidth="sm"
// 				onClose={onClose}
// 				open={open}
// 				sx={{
// 					"& .MuiDialog-container": { justifyContent: "flex-end" },
// 					"& .MuiDialog-paper": { height: "100%", width: "100%" },
// 				}}
// 			>
// 				<DialogContent sx={{ display: "flex", flexDirection: "column", minHeight: 0, p: 0 }}>
// 					<Stack
// 						direction="row"
// 						spacing={2}
// 						sx={{
// 							alignItems: "center",
// 							borderBottom: "1px solid var(--mui-palette-divider)",
// 							flex: "0 0 auto",
// 							justifyContent: "space-between",
// 							p: 3,
// 						}}
// 					>
// 						<IconButton
// 							onClick={() => {
// 								onFavorite?.(item.id, !item.isFavorite);
// 							}}
// 						>
// 							<StarIcon color="var(--mui-palette-warning-main)" weight={item.isFavorite ? "fill" : undefined} />
// 						</IconButton>
// 						<IconButton onClick={onClose}>
// 							<XIcon />
// 						</IconButton>
// 					</Stack>
// 					<Stack spacing={2} sx={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", px: 3, py: 2 }}>
// 						<Box
// 							sx={{
// 								border: "1px dashed var(--mui-palette-divider)",
// 								borderRadius: 1,
// 								display: "flex",
// 								flex: "0 0 auto",
// 								justifyContent: "center",
// 								p: 3,
// 							}}
// 						>
// 							<ItemIcon extension={item.extension} type={item.type} />
// 						</Box>
// 						<Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
// 							<Typography variant="h6">{item.name}</Typography>
// 							<IconButton>
// 								<PencilSimpleIcon />
// 							</IconButton>
// 						</Stack>
// 						<div>
// 							<Grid alignItems="center" container spacing={3}>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Created by
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									{item.author ? <Avatar src={item.author.avatar} /> : null}
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Size
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography variant="body2">{item.size}</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Created At
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography variant="body2">
// 										{item.createdAt ? dayjs(item.createdAt).format("MMM D, YYYY hh:mm A") : undefined}
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Modified At
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography variant="body2">
// 										{item.updatedAt ? dayjs(item.updatedAt).format("MMM D, YYYY hh:mm A") : undefined}
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Tags
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
// 										{tags.map((tag) => (
// 											<Chip
// 												key={tag}
// 												label={tag}
// 												onDelete={() => {
// 													// noop
// 												}}
// 												size="small"
// 												variant="soft"
// 											/>
// 										))}
// 										<IconButton onClick={tagsPopover.handleOpen} ref={tagsPopover.anchorRef}>
// 											<PlusIcon />
// 										</IconButton>
// 									</Stack>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Shared with
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
// 										{item.isPublic ? (
// 											<Tooltip title="Public">
// 												<Avatar sx={{ "--Avatar-size": "32px" }}>
// 													<GlobeIcon fontSize="var(--Icon-fontSize)" />
// 												</Avatar>
// 											</Tooltip>
// 										) : null}
// 										{showShared ? (
// 											<AvatarGroup max={3}>
// 												{sharedWith.map((person) => (
// 													<Avatar key={person.name} src={person.avatar} sx={{ "--Avatar-size": "32px" }} />
// 												))}
// 											</AvatarGroup>
// 										) : null}
// 										<IconButton>
// 											<PlusIcon />
// 										</IconButton>
// 									</Stack>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 4,
// 										xs: 12,
// 									}}
// 								>
// 									<Typography color="text.secondary" variant="body2">
// 										Actions
// 									</Typography>
// 								</Grid>
// 								<Grid
// 									size={{
// 										sm: 8,
// 										xs: 12,
// 									}}
// 								>
// 									<IconButton
// 										color="error"
// 										onClick={() => {
// 											onDelete?.(item.id);
// 										}}
// 									>
// 										<TrashIcon />
// 									</IconButton>
// 								</Grid>
// 							</Grid>
// 						</div>
// 					</Stack>
// 				</DialogContent>
// 			</Dialog>
// 			<Menu
// 				anchorEl={tagsPopover.anchorRef.current}
// 				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
// 				onClose={tagsPopover.handleClose}
// 				open={tagsPopover.open}
// 				transformOrigin={{ horizontal: "right", vertical: "top" }}
// 			>
// 				{tagOptions.map((option) => (
// 					<MenuItem key={option}>{option}</MenuItem>
// 				))}
// 			</Menu>
// 		</React.Fragment>
// 	);
// }
// item-modal.tsx
// item-modal.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';           // <‑‑ your project uses Grid2 (not Unstable_Grid2)
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Star as StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { dayjs } from '@/lib/dayjs';
import { usePopover } from '@/hooks/use-popover';

import { ItemIcon } from './item-icon';
import type { Item } from './types';

const tagOptions = [
  'Personal',
  'Work',
  'Business',
  'Accounting',
  'Security',
  'Design',
] as const;

export interface ItemModalProps {
  item: Item;
  onClose?: () => void;
  onDelete?: (itemId: string) => void;
  onFavorite?: (itemId: string, value: boolean) => void;
  open?: boolean;
}

/* ------------------------------------------------------------------ */
/* helper: build a small preview from raw text in localStorage        */
function getPreview(
  raw: string | null,
  ext: 'json' | 'csv'
): { headers: string[]; rows: Array<Record<string, string>> } {
  if (!raw) return { headers: [], rows: [] };

  try {
    if (ext === 'json') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const rows = parsed.slice(0, 5);
        const headers = Object.keys(rows[0] ?? {});
        return { headers, rows };
      }
      if (Array.isArray(parsed?.schema)) {
        const rows = parsed.schema.slice(0, 5);
        const headers = Object.keys(rows[0] ?? {});
        return { headers, rows };
      }
      return { headers: Object.keys(parsed).slice(0, 5), rows: [parsed] };
    }

    /* CSV */
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1, 6).map((line) => {
      const cells = line.split(',');
      return headers.reduce<Record<string, string>>((obj, h, i) => {
        obj[h] = cells[i]?.trim() ?? '';
        return obj;
      }, {});
    });
    return { headers, rows };
  } catch {
    return { headers: [], rows: [] };
  }
}
/* ------------------------------------------------------------------ */

export function ItemModal({
  item,
  onClose,
  onDelete,
  onFavorite,
  open = false,
}: ItemModalProps): React.JSX.Element {
  const tagsPopover = usePopover<HTMLButtonElement>();

  /* preview state */
  const [preview, setPreview] = React.useState<{
    headers: string[];
    rows: Array<Record<string, string>>;
  }>({ headers: [], rows: [] });

  React.useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(item.name);
    const ext = item.extension === 'csv' ? 'csv' : 'json';
    setPreview(getPreview(raw, ext));
  }, [open, item]);

  const { headers, rows } = preview;

  const tags = item.tags ?? [];
  const sharedWith = item.shared ?? [];
  const showShared = !item.isPublic && sharedWith.length > 0;

  return (
    <>
      <Dialog
        maxWidth="sm"
        onClose={onClose}
        open={open}
        sx={{
          '& .MuiDialog-container': { justifyContent: 'flex-end' },
          '& .MuiDialog-paper': { height: '100%', width: '100%' },
        }}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            p: 0,
          }}
        >
          {/* ---------- header ------------------------------------- */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              borderBottom: '1px solid var(--mui-palette-divider)',
              flex: '0 0 auto',
              justifyContent: 'space-between',
              p: 3,
            }}
          >
            <IconButton
              onClick={() => {
                onFavorite?.(item.id, !item.isFavorite);
              }}
            >
              <StarIcon
                color="var(--mui-palette-warning-main)"
                weight={item.isFavorite ? 'fill' : undefined}
              />
            </IconButton>
            <IconButton onClick={onClose}>
              <XIcon />
            </IconButton>
          </Stack>

          {/* ---------- body --------------------------------------- */}
          <Stack
            spacing={2}
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              px: 4,   // wider padding than before
              py: 3,
            }}
          >
            {/* icon */}
            <Box
              sx={{
                border: '1px dashed var(--mui-palette-divider)',
                borderRadius: 1,
                display: 'flex',
                flex: '0 0 auto',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <ItemIcon extension={item.extension} type={item.type} />
            </Box>

            {/* name + edit */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant="h6">{item.name}</Typography>
              <IconButton>
                <PencilSimpleIcon />
              </IconButton>
            </Stack>

            {/* ------------ FILE DETAILS --------------------------- */}
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              File details
            </Typography>

            <Grid
              container
              spacing={0}
              alignItems="center"
              sx={{ rowGap: 1.5 }} // vertical space between rows
            >
              {/* Created by */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Created by
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                {item.author ? <Avatar src={item.author.avatar} /> : null}
              </Grid>

              {/* Size */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Size
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Typography variant="body2">{item.size}</Typography>
              </Grid>

              {/* Created at */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Created At
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Typography variant="body2">
                  {item.createdAt
                    ? dayjs(item.createdAt).format('MMM D, YYYY hh:mm A')
                    : undefined}
                </Typography>
              </Grid>

              {/* Modified at */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Modified At
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Typography variant="body2">
                  {item.updatedAt
                    ? dayjs(item.updatedAt).format('MMM D, YYYY hh:mm A')
                    : undefined}
                </Typography>
              </Grid>

              {/* Tags */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Tags
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => {
                        /* noop */
                      }}
                      size="small"
                      variant="soft"
                    />
                  ))}
                  <IconButton
                    onClick={tagsPopover.handleOpen}
                    ref={tagsPopover.anchorRef}
                  >
                    <PlusIcon />
                  </IconButton>
                </Stack>
              </Grid>

              {/* Shared with */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Shared with
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {item.isPublic ? (
                    <Tooltip title="Public">
                      <Avatar sx={{ '--Avatar-size': '32px' }}>
                        <GlobeIcon fontSize="var(--Icon-fontSize')" />
                      </Avatar>
                    </Tooltip>
                  ) : null}
                  {showShared ? (
                    <AvatarGroup max={3}>
                      {sharedWith.map((p) => (
                        <Avatar
                          key={p.name}
                          src={p.avatar}
                          sx={{ '--Avatar-size': '32px' }}
                        />
                      ))}
                    </AvatarGroup>
                  ) : null}
                  <IconButton>
                    <PlusIcon />
                  </IconButton>
                </Stack>
              </Grid>

              {/* Actions */}
              <Grid xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  Actions
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <IconButton
                  color="error"
                  onClick={() => {
                    onDelete?.(item.id);
                  }}
                >
                  <TrashIcon />
                </IconButton>
              </Grid>
            </Grid>

            {/* ------------ DATA PREVIEW --------------------------- */}
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Data preview
            </Typography>

            {rows.length ? (
              <Box
                sx={{
                  overflowX: 'auto',
                  border: '1px solid var(--mui-palette-divider)',
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: 'background.paper',
                }}
              >
                <table
                  style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    minWidth: 450,
                  }}
                >
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--mui-palette-divider)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((h) => (
                          <td
                            key={h}
                            style={{
                              padding: '8px 12px',
                              borderBottom: '1px solid var(--mui-palette-divider)',
                              fontFamily: 'monospace',
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {String((row as any)[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2">
                Preview unavailable.
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* popover for adding tags */}
      <Menu
        anchorEl={tagsPopover.anchorRef.current}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={tagsPopover.handleClose}
        open={tagsPopover.open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {tagOptions.map((option) => (
          <MenuItem key={option}>{option}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

