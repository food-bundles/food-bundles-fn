// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuContent, MenuTemplate } from './types';
import { bistroStarter, chalkboardStarter, freshStarter, streetStarter } from './starters-a';
import { cafeStarter, elegantStarter, kigaliStarter } from './starters-b';

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    description: 'Dark card with set prices per section: lunch specials and set menus',
    layout: 'list',
    theme: {
      background: '#151515', surface: '#1f1f1f', text: '#f4f1ea', muted: '#bdb6aa', accent: '#f08a24', accent2: '#3d9be9',
      headingFont: "'Archivo Black', sans-serif", bodyFont: "'Nunito', sans-serif",
      fonts: ['Archivo+Black', 'Nunito:ital,wght@0,400;0,700;1,400'], uppercaseHeadings: true,
    },
    starter: chalkboardStarter,
  },
  {
    id: 'bistro',
    name: 'Classic Bistro',
    description: 'Cream paper, serif type and dotted price lines',
    layout: 'list',
    theme: {
      background: '#f6efe2', surface: '#efe5d2', text: '#2b1d14', muted: '#6b5848', accent: '#8c2f1b', accent2: '#c58b3a',
      headingFont: "'Playfair Display', serif", bodyFont: "'Lora', serif",
      fonts: ['Playfair+Display:ital,wght@0,600;0,800;1,600', 'Lora:ital,wght@0,400;0,600;1,400'], leaders: true,
    },
    starter: bistroStarter,
  },
  {
    id: 'fresh',
    name: 'Fresh & Green',
    description: 'Bright photo cards for salads, bowls and juices',
    layout: 'cards',
    theme: {
      background: '#ffffff', surface: '#f1f8f3', text: '#12301f', muted: '#5c7a68', accent: '#1f8a4c', accent2: '#f2b632',
      headingFont: "'Poppins', sans-serif", bodyFont: "'Poppins', sans-serif",
      fonts: ['Poppins:wght@400;600;800'], showImages: true,
    },
    starter: freshStarter,
  },
  {
    id: 'street',
    name: 'Street Food',
    description: 'Loud yellow and black with big prices: burgers, shawarma, fries',
    layout: 'bold',
    theme: {
      background: '#ffc928', surface: '#111111', text: '#111111', muted: '#3d3d3d', accent: '#d62828', accent2: '#111111',
      headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Roboto Condensed', sans-serif",
      fonts: ['Bebas+Neue', 'Roboto+Condensed:wght@400;700'], uppercaseHeadings: true, showImages: true,
    },
    starter: streetStarter,
  },
  {
    id: 'cafe',
    name: 'Café Mornings',
    description: 'Warm coffee tones for breakfast, drinks and cakes',
    layout: 'cards',
    theme: {
      background: '#f3e9dc', surface: '#fffaf3', text: '#4a3426', muted: '#8a6f5c', accent: '#c97b4a', accent2: '#6f4e37',
      headingFont: "'Pacifico', cursive", bodyFont: "'Quicksand', sans-serif",
      fonts: ['Pacifico', 'Quicksand:wght@400;600;700'], showImages: true,
    },
    starter: cafeStarter,
  },
  {
    id: 'elegant',
    name: 'Fine Dining',
    description: 'Black and gold, centred: tasting menus and hotel restaurants',
    layout: 'list',
    theme: {
      background: '#0e0e10', surface: '#17171a', text: '#ece6d6', muted: '#a39c8a', accent: '#c9a45c', accent2: '#c9a45c',
      headingFont: "'Cormorant Garamond', serif", bodyFont: "'Cormorant Garamond', serif",
      fonts: ['Cormorant+Garamond:ital,wght@0,500;0,700;1,500'], centered: true, uppercaseHeadings: true,
    },
    starter: elegantStarter,
  },
  {
    id: 'kigali',
    name: 'Local Kitchen',
    description: 'Rwandan buffet and grill, Food Bundles green',
    layout: 'list',
    theme: {
      background: '#fbf8f1', surface: '#eef5ef', text: '#0b2e1f', muted: '#4a6358', accent: '#0f5c36', accent2: '#e0a526',
      headingFont: "'Montserrat', sans-serif", bodyFont: "'Montserrat', sans-serif",
      fonts: ['Montserrat:wght@400;600;800'], uppercaseHeadings: true, leaders: true, showImages: true,
    },
    starter: kigaliStarter,
  },
];

export const getTemplate = (id: string): MenuTemplate => MENU_TEMPLATES.find((t) => t.id === id) ?? MENU_TEMPLATES[0];

/** A fresh copy of a template's content, titled with the business name */
export function startFromTemplate(id: string, businessName?: string): MenuContent {
  const content: MenuContent = JSON.parse(JSON.stringify(getTemplate(id).starter));
  if (businessName?.trim()) content.title = businessName.trim();
  return content;
}
