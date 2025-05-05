// 'use client';

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';

// import { GridView } from './grid-view';
// import { ItemModal } from './item-modal';
// import { ListView } from './list-view';
// import { StorageContext } from './storage-context';

// export interface StorageViewProps {
//   view: 'grid' | 'list';
// }

// export function StorageView({ view }: StorageViewProps): React.JSX.Element {
//   const { currentItemId, items, deleteItem, favoriteItem, setCurrentItemId } = React.useContext(StorageContext);

//   const currentItem = currentItemId ? items.get(currentItemId) : undefined;

//   return (
//     <React.Fragment>
//       {items.size ? (
//         <React.Fragment>{view === 'grid' ? <GridView /> : <ListView />}</React.Fragment>
//       ) : (
//         <Box sx={{ p: 3 }}>
//           <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
//             No items found
//           </Typography>
//         </Box>
//       )}
//       {currentItem ? (
//         <ItemModal
//           item={currentItem}
//           onClose={() => {
//             setCurrentItemId(undefined);
//           }}
//           onDelete={(itemId) => {
//             setCurrentItemId(undefined);
//             deleteItem(itemId);
//           }}
//           onFavorite={favoriteItem}
//           open
//         />
//       ) : null}
//     </React.Fragment>
//   );
// }
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { GridView } from './grid-view';
import { ListView } from './list-view';
import { ItemModal } from './item-modal';
import { StorageContext } from './storage-context';
import type { Item } from './types';

export interface StorageViewProps {
  view: 'grid' | 'list';
}

export function StorageView({ view }: StorageViewProps): React.JSX.Element {
  const {
    currentItemId,
    items,
    deleteItem,
    favoriteItem,
    setCurrentItemId,
  } = React.useContext(StorageContext);

  const currentItem = currentItemId ? items.get(currentItemId) : undefined;

  /* ---------- group items by origin ------------------------------- */
  const grouped = React.useMemo(() => {
    const json: Item[] = [];
    const csv: Item[] = [];

    items.forEach((it) => {
      if (it.origin === 'csv') csv.push(it);
      else json.push(it); // default
    });

    return { json, csv };
  }, [items]);

  const renderGroup = (title: string, groupItems: Item[]) => {
    if (!groupItems.length) return null;

    /* create a temporary context for this subgroup */
    const map = new Map(groupItems.map((it) => [it.id, it]));

    const providerValue = {
      currentItemId,
      setCurrentItemId,
      deleteItem,
      favoriteItem,
      items: map,
    };

    return (
      <React.Fragment key={title}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1, textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <StorageContext.Provider value={providerValue}>
          {view === 'grid' ? <GridView /> : <ListView />}
        </StorageContext.Provider>
      </React.Fragment>
    );
  };

  const hasItems = items.size > 0;

  return (
    <>
      {hasItems ? (
        <Stack spacing={3}>
          {renderGroup('JSON files', grouped.json)}
          {renderGroup('CSV (converted)', grouped.csv)}
        </Stack>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            No items found
          </Typography>
        </Box>
      )}

      {currentItem ? (
        <ItemModal
          item={currentItem}
          onClose={() => setCurrentItemId(undefined)}
          onDelete={(id) => {
            setCurrentItemId(undefined);
            deleteItem(id);
          }}
          onFavorite={favoriteItem}
          open
        />
      ) : null}
    </>
  );
}
