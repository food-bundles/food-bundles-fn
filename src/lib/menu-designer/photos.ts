// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.

/**
 * Built-in food photos (free to use, from Unsplash; linked as Unsplash asks).
 * Customers can also upload photos of their own dishes.
 */
export type PhotoCategory = 'mains' | 'grill' | 'fastfood' | 'salads' | 'soups' | 'breakfast' | 'desserts' | 'drinks';

export interface LibraryPhoto {
  id: string;
  label: string;
  category: PhotoCategory;
}

export const PHOTO_CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: 'mains', label: 'Main dishes' },
  { id: 'grill', label: 'Grill' },
  { id: 'fastfood', label: 'Fast food' },
  { id: 'salads', label: 'Salads & starters' },
  { id: 'soups', label: 'Soups & stews' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
];

export const LIBRARY_PHOTOS: LibraryPhoto[] = [
  { id: 'photo-1631515243349-e0cb75fb8d3a', label: 'Pilau / biryani', category: 'mains' },
  { id: 'photo-1585937421612-70a008356fbe', label: 'Curry stew', category: 'mains' },
  { id: 'photo-1588166524941-3bf61a9c41db', label: 'Curry with rice', category: 'mains' },
  { id: 'photo-1603133872878-684f208fb84b', label: 'Fried rice', category: 'mains' },
  { id: 'photo-1621996346565-e3dbc646d9a9', label: 'Pasta', category: 'mains' },
  { id: 'photo-1519708227418-c8fd9a32b7a2', label: 'Fish fillet', category: 'mains' },
  { id: 'photo-1604908176997-125f25cc6f3d', label: 'Stir-fry', category: 'mains' },
  { id: 'photo-1516684732162-798a0062be99', label: 'Steamed rice', category: 'mains' },
  { id: 'photo-1555939594-58d7cb561ad1', label: 'Brochettes', category: 'grill' },
  { id: 'photo-1600891964092-4316c288032e', label: 'Steak & fries', category: 'grill' },
  { id: 'photo-1598515214211-89d3c73ae83b', label: 'Grilled chicken', category: 'grill' },
  { id: 'photo-1568901346375-23c9450c58cd', label: 'Burger', category: 'fastfood' },
  { id: 'photo-1571091718767-18b5b1457add', label: 'Cheeseburger', category: 'fastfood' },
  { id: 'photo-1606755962773-d324e0a13086', label: 'Chicken burger', category: 'fastfood' },
  { id: 'photo-1626700051175-6818013e1d4f', label: 'Shawarma wraps', category: 'fastfood' },
  { id: 'photo-1529006557810-274b9b2fc783', label: 'Tacos', category: 'fastfood' },
  { id: 'photo-1565299624946-b28f40a0ae38', label: 'Pizza', category: 'fastfood' },
  { id: 'photo-1574071318508-1cdbab80d002', label: 'Margherita pizza', category: 'fastfood' },
  { id: 'photo-1573080496219-bb080dd4f877', label: 'Fries', category: 'fastfood' },
  { id: 'photo-1528735602780-2552fd46c7af', label: 'Toasted sandwich', category: 'fastfood' },
  { id: 'photo-1512621776951-a57141f2eefd', label: 'Vegetable salad', category: 'salads' },
  { id: 'photo-1540189549336-e6e99c3679fe', label: 'Green salad', category: 'salads' },
  { id: 'photo-1546069901-ba9599a7e63c', label: 'Chicken salad bowl', category: 'salads' },
  { id: 'photo-1547592180-85f173990554', label: 'Grain bowls', category: 'salads' },
  { id: 'photo-1505576399279-565b52d4ac71', label: 'Salad jar', category: 'salads' },
  { id: 'photo-1504674900247-0877df9cc836', label: 'Sharing starters', category: 'salads' },
  { id: 'photo-1455619452474-d2be8b1e70cd', label: 'Red curry soup', category: 'soups' },
  { id: 'photo-1559847844-5315695dadae', label: 'Seafood soup', category: 'soups' },
  { id: 'photo-1567620905732-2d1ec7ab7445', label: 'Pancakes', category: 'breakfast' },
  { id: 'photo-1525351484163-7529414344d8', label: 'Egg on toast', category: 'breakfast' },
  { id: 'photo-1509440159596-0249088772ff', label: 'Bread', category: 'breakfast' },
  { id: 'photo-1578985545062-69928b1d9587', label: 'Chocolate cake', category: 'desserts' },
  { id: 'photo-1571877227200-a0d98ea607e9', label: 'Tiramisu', category: 'desserts' },
  { id: 'photo-1497034825429-c343d7c6a68f', label: 'Ice cream', category: 'desserts' },
  { id: 'photo-1551024506-0bccd828d307', label: 'Caramel dessert', category: 'desserts' },
  { id: 'photo-1563805042-7684c019e1cb', label: 'Milkshake', category: 'drinks' },
  { id: 'photo-1495474472287-4d71bcdd2085', label: 'Coffee', category: 'drinks' },
  { id: 'photo-1556679343-c7306c1976bc', label: 'Iced tea', category: 'drinks' },
  { id: 'photo-1544145945-f90425340c7e', label: 'Cocktails', category: 'drinks' },
];

/** Address of a library photo at a given width */
export const photoUrl = (id: string, width = 600) =>
  `https://images.unsplash.com/${id}?w=${width}&h=${Math.round(width * 0.75)}&fit=crop&auto=format&q=70`;
