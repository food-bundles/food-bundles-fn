// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuContent, MenuDish, MenuIngredient } from './types';
import { photoUrl } from './photos';

/** Ingredient: name, quantity per plate (product unit, usually kg or litre), search words */
export const ing = (name: string, qty: number, ...match: string[]): MenuIngredient => ({ name, qty, match: match.length ? match : undefined });

/** Dish: id, name, description, own price (or none = section price), library photo, ingredients */
export const dish = (id: string, name: string, description: string, price: number | undefined, photo: string | undefined, ingredients: MenuIngredient[]): MenuDish => ({
  id,
  name,
  description: description || undefined,
  price,
  image: photo ? photoUrl(photo) : undefined,
  ingredients,
});

const POTATO = ['irish potato', 'potato', 'ibirayi'];
const BEEF = ['beef', 'inyama'];
const CHICKEN = ['chicken', 'inkoko'];
const OIL = ['cooking oil', 'oil'];

/** Like the One Cup lunch card: set prices per section, no photos */
export const chalkboardStarter: MenuContent = {
  title: 'Your Restaurant',
  note: 'Available 11AM - 4PM',
  contact: 'For reservation: 07XX XXX XXX',
  sections: [
    {
      id: 'lunch', title: 'Lunch special', price: 10000, dishes: [
        dish('cb1', 'Stew (Chicken / Beef / Vegetarian)', 'Served with fries, vegetable rice or steamed potatoes', undefined, undefined, [ing('Beef', 0.2, ...BEEF), ing('Irish potatoes', 0.3, ...POTATO), ing('Tomatoes', 0.1, 'tomato'), ing('Onions', 0.05, 'onion'), ing('Cooking oil', 0.03, ...OIL)]),
        dish('cb2', 'Shawarma (Chicken / Beef / Vegetarian)', 'Served with chips', undefined, undefined, [ing('Chicken', 0.15, ...CHICKEN), ing('Irish potatoes', 0.3, ...POTATO), ing('Cabbage', 0.05, 'cabbage'), ing('Wheat flour', 0.08, 'wheat flour', 'flour')]),
        dish('cb3', 'Burger (Chicken / Beef / Vegetarian)', 'Served with chips', undefined, undefined, [ing('Beef', 0.15, ...BEEF), ing('Irish potatoes', 0.3, ...POTATO), ing('Tomatoes', 0.04, 'tomato'), ing('Lettuce', 0.03, 'lettuce')]),
        dish('cb4', 'Pizza (Chicken / Beef / Vegetarian)', '', undefined, undefined, [ing('Wheat flour', 0.15, 'wheat flour', 'flour'), ing('Cheese', 0.08, 'cheese'), ing('Tomatoes', 0.1, 'tomato'), ing('Chicken', 0.08, ...CHICKEN)]),
        dish('cb5', 'Spaghetti Bolognese', '', undefined, undefined, [ing('Spaghetti', 0.15, 'spaghetti', 'pasta'), ing('Beef', 0.12, ...BEEF), ing('Tomatoes', 0.15, 'tomato'), ing('Onions', 0.05, 'onion')]),
      ],
    },
    {
      id: 'set', title: 'Set menu', price: 16000, note: 'Starter and main course, with house fries, creamed potatoes or steamed rice', dishes: [
        dish('cb6', 'Avocado & Egg Salad', 'Starter', undefined, undefined, [ing('Avocado', 0.15, 'avocado'), ing('Tomatoes', 0.05, 'tomato'), ing('Lettuce', 0.05, 'lettuce')]),
        dish('cb7', 'Vegetable Soup', 'Starter', undefined, undefined, [ing('Carrots', 0.1, 'carrot'), ing('Irish potatoes', 0.1, ...POTATO), ing('Onions', 0.05, 'onion')]),
        dish('cb8', 'Stir-Fry Chicken / Beef', 'Main course', undefined, undefined, [ing('Chicken', 0.2, ...CHICKEN), ing('Green pepper', 0.05, 'green pepper', 'pepper'), ing('Carrots', 0.05, 'carrot'), ing('Rice', 0.12, 'rice')]),
        dish('cb9', 'Beef Bourguignon', 'Main course', undefined, undefined, [ing('Beef', 0.25, ...BEEF), ing('Carrots', 0.08, 'carrot'), ing('Onions', 0.08, 'onion'), ing('Irish potatoes', 0.25, ...POTATO)]),
        dish('cb10', 'Vegetable Stew', 'Main course', undefined, undefined, [ing('Beans', 0.12, 'bean'), ing('Carrots', 0.08, 'carrot'), ing('Tomatoes', 0.1, 'tomato'), ing('Rice', 0.12, 'rice')]),
      ],
    },
  ],
};

/** Classic bistro: own price per dish, dotted lines */
export const bistroStarter: MenuContent = {
  title: 'Le Petit Bistro',
  subtitle: 'Seasonal cooking with local produce',
  contact: 'Reservations: 07XX XXX XXX',
  sections: [
    {
      id: 'starters', title: 'Starters', dishes: [
        dish('bi1', 'Avocado vinaigrette', 'Ripe avocado, lemon and herb dressing', 4500, undefined, [ing('Avocado', 0.2, 'avocado'), ing('Lemon', 0.03, 'lemon')]),
        dish('bi2', 'Soup of the day', 'Ask your waiter', 4000, undefined, [ing('Carrots', 0.1, 'carrot'), ing('Irish potatoes', 0.1, ...POTATO), ing('Onions', 0.05, 'onion')]),
      ],
    },
    {
      id: 'mains', title: 'Main courses', dishes: [
        dish('bi3', 'Beef fillet, pepper sauce', 'With hand-cut fries', 14000, undefined, [ing('Beef', 0.25, ...BEEF), ing('Irish potatoes', 0.3, ...POTATO), ing('Milk', 0.05, 'milk')]),
        dish('bi4', 'Grilled tilapia', 'Lemon butter, steamed rice', 12000, undefined, [ing('Tilapia', 0.4, 'tilapia', 'fish'), ing('Rice', 0.12, 'rice'), ing('Lemon', 0.03, 'lemon')]),
        dish('bi5', 'Chicken in mushroom sauce', 'Creamy mash', 11000, undefined, [ing('Chicken', 0.3, ...CHICKEN), ing('Mushrooms', 0.08, 'mushroom'), ing('Irish potatoes', 0.25, ...POTATO), ing('Milk', 0.05, 'milk')]),
        dish('bi6', 'Vegetable lasagne', 'Eggplant, tomato and cheese', 9000, undefined, [ing('Eggplant', 0.1, 'eggplant', 'aubergine'), ing('Tomatoes', 0.15, 'tomato'), ing('Cheese', 0.08, 'cheese'), ing('Wheat flour', 0.1, 'wheat flour', 'flour')]),
      ],
    },
    {
      id: 'desserts', title: 'Desserts', dishes: [
        dish('bi7', 'Chocolate mousse', '', 4000, undefined, [ing('Milk', 0.1, 'milk'), ing('Sugar', 0.03, 'sugar')]),
        dish('bi8', 'Fresh fruit salad', 'Pineapple, mango, banana, passion', 3500, undefined, [ing('Pineapple', 0.1, 'pineapple'), ing('Mango', 0.1, 'mango'), ing('Bananas', 0.1, 'banana'), ing('Passion fruit', 0.05, 'passion')]),
      ],
    },
  ],
};

/** Fresh & healthy: photo cards */
export const freshStarter: MenuContent = {
  title: 'Green Bowl',
  subtitle: 'Fresh, healthy, made today',
  sections: [
    {
      id: 'bowls', title: 'Bowls & salads', dishes: [
        dish('fr1', 'Chicken salad bowl', 'Grilled chicken, avocado, crunchy vegetables', 7500, 'photo-1546069901-ba9599a7e63c', [ing('Chicken', 0.15, ...CHICKEN), ing('Lettuce', 0.08, 'lettuce'), ing('Avocado', 0.1, 'avocado'), ing('Cucumber', 0.05, 'cucumber'), ing('Tomatoes', 0.05, 'tomato')]),
        dish('fr2', 'Garden salad', 'Lettuce, cucumber, tomato, carrot', 5000, 'photo-1540189549336-e6e99c3679fe', [ing('Lettuce', 0.1, 'lettuce'), ing('Cucumber', 0.08, 'cucumber'), ing('Tomatoes', 0.08, 'tomato'), ing('Carrots', 0.05, 'carrot')]),
        dish('fr3', 'Grain bowl', 'Rice, beans, avocado and greens', 6500, 'photo-1547592180-85f173990554', [ing('Rice', 0.1, 'rice'), ing('Beans', 0.08, 'bean'), ing('Avocado', 0.1, 'avocado'), ing('Carrots', 0.05, 'carrot')]),
      ],
    },
    {
      id: 'hot', title: 'Hot plates', dishes: [
        dish('fr4', 'Grilled chicken & vegetables', 'Herb marinated', 9000, 'photo-1598515214211-89d3c73ae83b', [ing('Chicken', 0.3, ...CHICKEN), ing('Carrots', 0.08, 'carrot'), ing('Green beans', 0.08, 'green bean', 'french bean')]),
        dish('fr5', 'Fish fillet & rice', 'Pan-seared, lemon', 11000, 'photo-1519708227418-c8fd9a32b7a2', [ing('Fish', 0.3, 'tilapia', 'fish'), ing('Rice', 0.12, 'rice'), ing('Lemon', 0.03, 'lemon')]),
      ],
    },
    {
      id: 'drinks', title: 'Fresh drinks', dishes: [
        dish('fr6', 'Passion juice', 'Freshly pressed', 2500, 'photo-1556679343-c7306c1976bc', [ing('Passion fruit', 0.15, 'passion'), ing('Sugar', 0.02, 'sugar')]),
        dish('fr7', 'Mango smoothie', 'Mango and milk', 3000, 'photo-1563805042-7684c019e1cb', [ing('Mango', 0.25, 'mango'), ing('Milk', 0.15, 'milk')]),
      ],
    },
  ],
};

/** Burgers, shawarma and fries: bold and loud */
export const streetStarter: MenuContent = {
  title: 'Big Bite',
  subtitle: 'Burgers · Shawarma · Fries',
  contact: 'Order: 07XX XXX XXX',
  sections: [
    {
      id: 'burgers', title: 'Burgers', dishes: [
        dish('st1', 'Classic beef burger', 'Beef, tomato, onion, lettuce', 6000, 'photo-1568901346375-23c9450c58cd', [ing('Beef', 0.15, ...BEEF), ing('Tomatoes', 0.04, 'tomato'), ing('Onions', 0.03, 'onion'), ing('Lettuce', 0.03, 'lettuce')]),
        dish('st2', 'Cheeseburger', 'Double cheese', 7000, 'photo-1571091718767-18b5b1457add', [ing('Beef', 0.15, ...BEEF), ing('Cheese', 0.04, 'cheese'), ing('Tomatoes', 0.04, 'tomato')]),
        dish('st3', 'Chicken burger', 'Crispy chicken, slaw', 6500, 'photo-1606755962773-d324e0a13086', [ing('Chicken', 0.15, ...CHICKEN), ing('Cabbage', 0.04, 'cabbage')]),
      ],
    },
    {
      id: 'wraps', title: 'Shawarma', dishes: [
        dish('st4', 'Chicken shawarma', 'Garlic sauce, pickles', 5000, 'photo-1626700051175-6818013e1d4f', [ing('Chicken', 0.15, ...CHICKEN), ing('Cabbage', 0.05, 'cabbage'), ing('Tomatoes', 0.04, 'tomato'), ing('Wheat flour', 0.08, 'wheat flour', 'flour')]),
        dish('st5', 'Beef shawarma', 'Tahini, onions', 5500, undefined, [ing('Beef', 0.15, ...BEEF), ing('Onions', 0.04, 'onion'), ing('Wheat flour', 0.08, 'wheat flour', 'flour')]),
      ],
    },
    {
      id: 'sides', title: 'Sides & shakes', dishes: [
        dish('st6', 'Fries', 'Big portion', 2000, 'photo-1573080496219-bb080dd4f877', [ing('Irish potatoes', 0.35, ...POTATO), ing('Cooking oil', 0.05, ...OIL)]),
        dish('st7', 'Milkshake', 'Vanilla, chocolate or strawberry', 3500, 'photo-1563805042-7684c019e1cb', [ing('Milk', 0.25, 'milk'), ing('Sugar', 0.03, 'sugar')]),
      ],
    },
  ],
};
