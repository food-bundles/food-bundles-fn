// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuContent } from './types';
import { dish, ing } from './starters-a';

const POTATO = ['irish potato', 'potato', 'ibirayi'];
const BEEF = ['beef', 'inyama'];
const CHICKEN = ['chicken', 'inkoko'];

/** Coffee shop and breakfast */
export const cafeStarter: MenuContent = {
  title: 'Morning Café',
  subtitle: 'Coffee · Breakfast · Cakes',
  note: 'Open every day 7AM - 6PM',
  sections: [
    {
      id: 'breakfast', title: 'Breakfast', dishes: [
        dish('ca1', 'Pancakes & honey', 'Three fluffy pancakes', 4500, 'photo-1567620905732-2d1ec7ab7445', [ing('Wheat flour', 0.08, 'wheat flour', 'flour'), ing('Milk', 0.1, 'milk'), ing('Honey', 0.03, 'honey')]),
        dish('ca2', 'Egg on toast', 'With smashed avocado', 5000, 'photo-1525351484163-7529414344d8', [ing('Avocado', 0.1, 'avocado'), ing('Bread', 0.1, 'bread')]),
      ],
    },
    {
      id: 'coffee', title: 'Coffee & tea', dishes: [
        dish('ca3', 'Cappuccino', 'Rwandan single origin', 2500, 'photo-1495474472287-4d71bcdd2085', [ing('Coffee', 0.018, 'coffee'), ing('Milk', 0.15, 'milk')]),
        dish('ca4', 'African tea', 'Spiced with ginger', 1500, undefined, [ing('Tea leaves', 0.005, 'tea'), ing('Milk', 0.2, 'milk'), ing('Ginger', 0.005, 'ginger')]),
        dish('ca5', 'Iced tea', 'Lemon and mint', 2000, 'photo-1556679343-c7306c1976bc', [ing('Tea leaves', 0.005, 'tea'), ing('Lemon', 0.02, 'lemon'), ing('Sugar', 0.02, 'sugar')]),
      ],
    },
    {
      id: 'cakes', title: 'Cakes', dishes: [
        dish('ca6', 'Chocolate cake', 'A generous slice', 3500, 'photo-1578985545062-69928b1d9587', [ing('Wheat flour', 0.05, 'wheat flour', 'flour'), ing('Sugar', 0.04, 'sugar'), ing('Milk', 0.05, 'milk')]),
        dish('ca7', 'Banana bread', 'Made with local bananas', 2500, undefined, [ing('Bananas', 0.1, 'banana'), ing('Wheat flour', 0.05, 'wheat flour', 'flour'), ing('Sugar', 0.03, 'sugar')]),
      ],
    },
  ],
};

/** Fine dining, tasting menu */
export const elegantStarter: MenuContent = {
  title: 'Maison Kigali',
  subtitle: 'Tasting menu',
  note: 'Dinner from 7PM',
  sections: [
    {
      id: 'begin', title: 'To begin', dishes: [
        dish('el1', 'Tilapia ceviche', 'Passion fruit, chilli, lime', 9000, undefined, [ing('Tilapia', 0.12, 'tilapia', 'fish'), ing('Passion fruit', 0.05, 'passion'), ing('Chilli', 0.01, 'chili', 'pili'), ing('Lemon', 0.03, 'lemon', 'lime')]),
        dish('el2', 'Roasted pumpkin velouté', 'Toasted seeds', 7000, undefined, [ing('Pumpkin', 0.25, 'pumpkin'), ing('Milk', 0.08, 'milk'), ing('Onions', 0.04, 'onion')]),
      ],
    },
    {
      id: 'mains', title: 'Main courses', dishes: [
        dish('el3', 'Beef fillet', 'Sweet potato purée, red wine jus', 22000, undefined, [ing('Beef', 0.25, ...BEEF), ing('Sweet potatoes', 0.25, 'sweet potato'), ing('Milk', 0.05, 'milk')]),
        dish('el4', 'Free-range chicken', 'Mushroom jus, roasted potatoes', 18000, undefined, [ing('Chicken', 0.35, ...CHICKEN), ing('Mushrooms', 0.1, 'mushroom'), ing('Irish potatoes', 0.2, ...POTATO)]),
        dish('el5', 'Garden risotto', 'Peas, parmesan', 15000, undefined, [ing('Rice', 0.12, 'rice'), ing('Peas', 0.08, 'peas'), ing('Cheese', 0.04, 'cheese')]),
      ],
    },
    {
      id: 'sweet', title: 'Desserts', dishes: [
        dish('el6', 'Dark chocolate tart', '', 8000, undefined, [ing('Wheat flour', 0.05, 'wheat flour', 'flour'), ing('Sugar', 0.04, 'sugar'), ing('Milk', 0.05, 'milk')]),
        dish('el7', 'Pineapple carpaccio', 'Mint and lime', 6000, undefined, [ing('Pineapple', 0.25, 'pineapple')]),
      ],
    },
  ],
};

/** Home-style Rwandan buffet and grill */
export const kigaliStarter: MenuContent = {
  title: 'Igikoni Cyacu',
  subtitle: 'Home-style Rwandan food',
  note: 'Buffet 12PM - 3PM',
  sections: [
    {
      id: 'buffet', title: 'Buffet', price: 5000, note: 'Serve yourself: one plate', dishes: [
        dish('kg1', 'Isombe', 'Cassava leaves, eggplant, peanut', undefined, undefined, [ing('Cassava leaves', 0.15, 'cassava lea', 'isombe'), ing('Eggplant', 0.05, 'eggplant'), ing('Onions', 0.03, 'onion')]),
        dish('kg2', 'Matoke', 'Plantain in tomato sauce', undefined, undefined, [ing('Plantain', 0.3, 'plantain', 'matoke', 'cooking banana'), ing('Tomatoes', 0.05, 'tomato'), ing('Onions', 0.03, 'onion')]),
        dish('kg3', 'Beans', 'Slow cooked', undefined, undefined, [ing('Beans', 0.12, 'bean'), ing('Onions', 0.03, 'onion'), ing('Tomatoes', 0.05, 'tomato')]),
        dish('kg4', 'Rice & sweet potatoes', '', undefined, undefined, [ing('Rice', 0.12, 'rice'), ing('Sweet potatoes', 0.2, 'sweet potato')]),
      ],
    },
    {
      id: 'grill', title: 'From the grill', dishes: [
        dish('kg5', 'Beef brochettes & fries', 'Two skewers', 6000, 'photo-1555939594-58d7cb561ad1', [ing('Beef', 0.2, ...BEEF), ing('Irish potatoes', 0.3, ...POTATO)]),
        dish('kg6', 'Grilled tilapia', 'Whole fish, chips or plantain', 10000, 'photo-1519708227418-c8fd9a32b7a2', [ing('Tilapia', 0.5, 'tilapia', 'fish'), ing('Irish potatoes', 0.3, ...POTATO)]),
        dish('kg7', 'Pilau', 'Spiced rice with beef', 5500, 'photo-1631515243349-e0cb75fb8d3a', [ing('Rice', 0.15, 'rice'), ing('Beef', 0.12, ...BEEF), ing('Onions', 0.04, 'onion')]),
      ],
    },
    {
      id: 'drinks', title: 'Drinks', dishes: [
        dish('kg8', 'Fresh passion juice', '', 1500, undefined, [ing('Passion fruit', 0.12, 'passion'), ing('Sugar', 0.02, 'sugar')]),
        dish('kg9', 'African tea', '', 1000, undefined, [ing('Tea leaves', 0.005, 'tea'), ing('Milk', 0.2, 'milk')]),
      ],
    },
  ],
};
