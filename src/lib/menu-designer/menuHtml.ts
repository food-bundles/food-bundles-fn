// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuContent, MenuDish, MenuSection, MenuTemplate } from './types';
import { fullRwf, shortRwf } from './costing';
import { menuCss } from './menuCss';

/**
 * The finished menu as one HTML page (A4 width): the website shows it in a
 * frame and prints it; the app shows it in a web view and turns it into a PDF.
 */
const esc = (s?: string) =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const price = (n?: number) => (n ? `<span class="price">${esc(fullRwf(n).replace(' RWF', ''))}</span>` : '');

const image = (dish: MenuDish, template: MenuTemplate, cls: string) =>
  template.theme.showImages && dish.image ? `<img class="${cls}" src="${esc(dish.image)}" alt="" crossorigin="anonymous" />` : '';

const sectionHead = (s: MenuSection) => `
  <div class="section-head">
    <h2>${esc(s.title)}</h2>
    ${s.price ? `<div class="set-price"><span class="at">@</span> ${esc(shortRwf(s.price))} <small>RWF</small></div>` : ''}
  </div>
  ${s.note ? `<p class="section-note">${esc(s.note)}</p>` : ''}`;

const listDish = (d: MenuDish, t: MenuTemplate) => `
  <div class="dish">
    ${image(d, t, 'thumb')}
    <div class="dish-body">
      <div class="dish-line"><h3>${esc(d.name)}</h3>${t.theme.leaders && d.price ? '<span class="leader"></span>' : ''}${price(d.price)}</div>
      ${d.description ? `<p class="desc">${esc(d.description)}</p>` : ''}
    </div>
  </div>`;

const cardDish = (d: MenuDish, t: MenuTemplate) => `
  <div class="card">
    ${image(d, t, 'card-img')}
    <div class="card-body">
      <h3>${esc(d.name)}</h3>
      ${d.description ? `<p class="desc">${esc(d.description)}</p>` : ''}
      ${d.price ? `<div class="card-price">${esc(fullRwf(d.price))}</div>` : ''}
    </div>
  </div>`;

const boldDish = (d: MenuDish, t: MenuTemplate) => `
  <div class="bold-dish">
    ${image(d, t, 'round')}
    <div class="dish-body"><h3>${esc(d.name)}</h3>${d.description ? `<p class="desc">${esc(d.description)}</p>` : ''}</div>
    ${d.price ? `<div class="big-price">${esc(shortRwf(d.price))}</div>` : ''}
  </div>`;

const section = (s: MenuSection, t: MenuTemplate) => {
  const dishes = s.dishes.filter((d) => d.name.trim());
  const body =
    t.layout === 'cards'
      ? `<div class="cards">${dishes.map((d) => cardDish(d, t)).join('')}</div>`
      : t.layout === 'bold'
        ? `<div class="bold-list">${dishes.map((d) => boldDish(d, t)).join('')}</div>`
        : `<div class="dishes ${dishes.length > 3 && !t.theme.centered ? 'two-col' : ''}">${dishes.map((d) => listDish(d, t)).join('')}</div>`;
  return `<section class="menu-section">${sectionHead(s)}${body}</section>`;
};

export interface MenuHtmlOptions {
  /** Shrinks the page to fit a narrow screen (app preview) */
  fitWidth?: boolean;
}

export function renderMenuHtml(content: MenuContent, template: MenuTemplate, options: MenuHtmlOptions = {}): string {
  const fonts = template.theme.fonts.map((f) => `family=${f}`).join('&');
  const meta = [content.note, content.contact].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join('<span class="dot">•</span>');
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=${options.fitWidth ? 'device-width' : '794'}, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet" />
<style>${menuCss(template, options.fitWidth)}</style></head>
<body><main class="page layout-${template.layout} tpl-${template.id}">
  <header class="menu-head">
    <div class="ornament"></div>
    <h1>${esc(content.title || 'Menu')}</h1>
    ${content.subtitle ? `<p class="subtitle">${esc(content.subtitle)}</p>` : ''}
    ${meta ? `<p class="meta">${meta}</p>` : ''}
  </header>
  ${content.sections.filter((s) => s.title.trim() || s.dishes.length).map((s) => section(s, template)).join('')}
  <footer class="menu-foot">Prices in RWF</footer>
</main></body></html>`;
}
