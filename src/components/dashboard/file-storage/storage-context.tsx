// 'use client';

// import * as React from 'react';
// import type { Item } from './types';

// function noop(): void {
//   return undefined;
// }

// export interface StorageContextValue {
//   items: Map<string, Item>;
//   currentItemId?: string;
//   setCurrentItemId: (itemId?: string) => void;
//   deleteItem: (itemId: string) => void;
//   favoriteItem: (itemId: string, value: boolean) => void;
// }

// export const StorageContext = React.createContext<StorageContextValue>({
//   items: new Map(),
//   setCurrentItemId: noop,
//   deleteItem: noop,
//   favoriteItem: noop,
// });

// export interface StorageProviderProps {
//   children: React.ReactNode;
//   items: Item[];
// }

// export function StorageProvider({ children, items: initialItems = [] }: StorageProviderProps): React.JSX.Element {
//   const [items, setItems] = React.useState(new Map<string, Item>());
//   const [currentItemId, setCurrentItemId] = React.useState<string>();

//   React.useEffect((): void => {
//     setItems(new Map(initialItems.map((item) => [item.id, item])));
//   }, [initialItems]);

//   // Persist items to localStorage whenever items change
//   React.useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Convert map to array
//       const itemsArray = Array.from(items.values());
//       localStorage.setItem('uploadedItems', JSON.stringify(itemsArray));
//     }
//   }, [items]);

//   const handleDeleteItem = React.useCallback(
//     (itemId: string) => {
//       const item = items.get(itemId);

//       if (!item) {
//         return;
//       }

//       const updatedItems = new Map(items);
//       updatedItems.delete(itemId);
//       setItems(updatedItems);
//       // No need to manually save here because of the useEffect above
//     },
//     [items]
//   );

//   const handleFavoriteItem = React.useCallback(
//     (itemId: string, value: boolean) => {
//       const item = items.get(itemId);

//       if (!item) {
//         return;
//       }

//       const updatedItems = new Map(items);
//       updatedItems.set(itemId, { ...item, isFavorite: value });
//       setItems(updatedItems);
//       // No need to manually save here because of the useEffect above
//     },
//     [items]
//   );

//   return (
//     <StorageContext.Provider
//       value={{ items, currentItemId, setCurrentItemId, deleteItem: handleDeleteItem, favoriteItem: handleFavoriteItem }}
//     >
//       {children}
//     </StorageContext.Provider>
//   );
// }

// export const StorageConsumer = StorageContext.Consumer;
'use client';

import * as React from 'react';
import type { Item } from './types';   // Item now includes `origin`

function noop(): void {
  return undefined;
}

export interface StorageContextValue {
  items: Map<string, Item>;
  currentItemId?: string;
  setCurrentItemId: (itemId?: string) => void;
  deleteItem: (itemId: string) => void;
  favoriteItem: (itemId: string, value: boolean) => void;
}

export const StorageContext = React.createContext<StorageContextValue>({
  items: new Map(),
  setCurrentItemId: noop,
  deleteItem: noop,
  favoriteItem: noop,
});

export interface StorageProviderProps {
  children: React.ReactNode;
  items: Item[];
}

export function StorageProvider({
  children,
  items: initialItems = [],
}: StorageProviderProps): React.JSX.Element {
  const [items, setItems] = React.useState(new Map<string, Item>());
  const [currentItemId, setCurrentItemId] = React.useState<string>();

  /* hydrate */
  React.useEffect(() => {
    setItems(new Map(initialItems.map((it) => [it.id, it])));
  }, [initialItems]);

  /* persist */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const itemsArray = Array.from(items.values());
      localStorage.setItem('uploadedItems', JSON.stringify(itemsArray));
    }
  }, [items]);

  const handleDeleteItem = React.useCallback(
    (itemId: string) => {
      if (!items.has(itemId)) return;
      const updated = new Map(items);
      updated.delete(itemId);
      setItems(updated);
    },
    [items]
  );

  const handleFavoriteItem = React.useCallback(
    (itemId: string, value: boolean) => {
      const item = items.get(itemId);
      if (!item) return;
      const updated = new Map(items);
      updated.set(itemId, { ...item, isFavorite: value });
      setItems(updated);
    },
    [items]
  );

  return (
    <StorageContext.Provider
      value={{
        items,
        currentItemId,
        setCurrentItemId,
        deleteItem: handleDeleteItem,
        favoriteItem: handleFavoriteItem,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export const StorageConsumer = StorageContext.Consumer;
