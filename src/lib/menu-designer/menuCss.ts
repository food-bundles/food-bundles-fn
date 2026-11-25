// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuTemplate } from './types';

/** The look of each template: one stylesheet driven by the template's colours and fonts */
export function menuCss(t: MenuTemplate, fitWidth = false): string {
  const th = t.theme;
  const upper = th.uppercaseHeadings ? 'text-transform:uppercase;' : '';
  return `
:root{--bg:${th.background};--surface:${th.surface};--text:${th.text};--muted:${th.muted};--accent:${th.accent};--accent2:${th.accent2};}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
html,body{background:var(--bg);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{color:var(--text);font-family:${th.bodyFont};font-size:15px;line-height:1.45}
.page{width:${fitWidth ? '100%' : '794px'};min-height:${fitWidth ? 'auto' : '1123px'};margin:0 auto;padding:${fitWidth ? '28px 20px' : '56px 60px'};background:var(--bg)}
h1,h2,h3{font-family:${th.headingFont};font-weight:800;line-height:1.1;overflow-wrap:anywhere}
.cards>*,.dishes>*{min-width:0}
.menu-head{text-align:center;margin-bottom:34px}
.menu-head h1{font-size:${fitWidth ? '34px' : '52px'};${upper}letter-spacing:.02em;color:var(--text)}
.subtitle{margin-top:8px;font-size:17px;color:var(--muted);font-style:italic}
.meta{margin-top:12px;font-size:14px;font-weight:700;color:var(--accent);display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.meta .dot{color:var(--muted)}
.ornament{height:6px;width:120px;margin:0 auto 18px;border-radius:3px;background:var(--accent)}
.menu-section{margin-top:30px;break-inside:avoid}
.section-head{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:6px}
.section-head h2{font-size:${fitWidth ? '24px' : '32px'};${upper}color:var(--text)}
.set-price{font-family:${th.headingFont};font-size:${fitWidth ? '22px' : '30px'};color:var(--accent);border-top:2px dotted var(--muted);border-bottom:2px dotted var(--muted);padding:2px 14px}
.set-price small{font-size:.5em;letter-spacing:.08em}
.set-price .at{font-size:.6em;color:var(--muted)}
.section-note{color:var(--muted);font-style:italic;margin-bottom:6px}
.dishes{margin-top:14px;display:grid;gap:16px 36px}
.dishes.two-col{grid-template-columns:${fitWidth ? '1fr' : '1fr 1fr'}}
.dish{display:flex;gap:12px;align-items:flex-start}
.dish-body{flex:1;min-width:0}
.dish-line{display:flex;align-items:baseline;gap:8px}
.dish h3{font-size:18px;color:var(--text)}
.leader{flex:1;border-bottom:2px dotted var(--muted);transform:translateY(-4px);min-width:16px}
.price{font-family:${th.headingFont};font-weight:800;color:var(--accent);white-space:nowrap;margin-left:auto}
.desc{color:var(--muted);font-size:14px;font-style:italic;margin-top:3px}
.thumb{width:62px;height:62px;border-radius:50%;object-fit:cover;flex:none;border:3px solid var(--surface)}
.cards{margin-top:14px;display:grid;grid-template-columns:${fitWidth ? '1fr 1fr' : '1fr 1fr 1fr'};gap:16px;align-items:start}
.card{background:var(--surface);border-radius:18px;overflow:hidden;break-inside:avoid}
.card-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.card-body{padding:12px 14px 14px}
.card h3{font-size:16px}
.card-price{margin-top:8px;display:inline-block;background:var(--accent);color:#fff;font-weight:800;border-radius:999px;padding:3px 12px;font-size:13px}
.bold-list{margin-top:12px;display:grid;gap:12px}
.bold-dish{display:flex;align-items:center;gap:14px;background:var(--surface);color:var(--bg);border-radius:16px;padding:10px 16px}
.bold-dish h3{font-size:24px;letter-spacing:.03em;color:var(--bg)}
.bold-dish .desc{color:#d9d9d9}
.round{width:70px;height:70px;border-radius:50%;object-fit:cover;flex:none;border:3px solid var(--bg)}
.big-price{font-family:${th.headingFont};font-size:38px;color:var(--bg);background:var(--accent);border-radius:12px;padding:0 12px;line-height:1.3}
.menu-foot{margin-top:40px;text-align:center;font-size:12px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
/* Template touches */
.tpl-chalkboard .ornament{display:none}
.tpl-chalkboard .section-head h2{padding-left:18px;border-left:10px solid transparent;border-image:repeating-linear-gradient(135deg,var(--accent) 0 4px,transparent 4px 7px,var(--accent2) 7px 11px,transparent 11px 14px) 10}
.tpl-chalkboard .menu-head h1{font-size:${fitWidth ? '30px' : '44px'}}
.tpl-bistro .menu-head{border-top:4px double var(--accent);border-bottom:4px double var(--accent);padding:18px 0}
.tpl-bistro .ornament{display:none}
.tpl-bistro .section-head{justify-content:center}
.tpl-bistro .section-head h2{font-style:italic;color:var(--accent)}
.tpl-elegant .page{text-align:center}
.tpl-elegant .ornament{height:1px;width:220px}
.tpl-elegant .section-head{justify-content:center}
.tpl-elegant .section-head h2{letter-spacing:.25em;font-weight:500;color:var(--accent);font-size:22px}
.tpl-elegant .section-head h2::before,.tpl-elegant .section-head h2::after{content:' ✦ ';color:var(--accent)}
.tpl-elegant .dish{justify-content:center;text-align:center}
.tpl-elegant .dish-line{flex-direction:column;align-items:center;gap:2px}
.tpl-elegant .dish h3{font-size:22px;font-weight:700}
.tpl-elegant .price{margin-left:0}
.tpl-street .menu-head h1{font-size:${fitWidth ? '56px' : '96px'};line-height:.9;color:var(--surface)}
.tpl-street .ornament{background:var(--accent);height:10px}
.tpl-street .subtitle{color:var(--surface);font-style:normal;font-weight:700}
.tpl-street .section-head h2{background:var(--surface);color:var(--bg);padding:4px 14px;border-radius:10px;font-size:${fitWidth ? '30px' : '40px'}}
.tpl-cafe .menu-head h1{font-weight:400;color:var(--accent2)}
.tpl-cafe .section-head h2{font-weight:400;color:var(--accent)}
.tpl-cafe .card h3{font-family:${th.bodyFont};font-weight:700}
.tpl-kigali .ornament{height:14px;width:100%;border-radius:0;background:repeating-linear-gradient(135deg,var(--accent) 0 10px,var(--bg) 10px 14px,var(--accent2) 14px 24px,var(--bg) 24px 28px)}
.tpl-kigali .section-head h2{color:var(--accent)}
.tpl-fresh .section-head h2{color:var(--accent)}
`;
}
