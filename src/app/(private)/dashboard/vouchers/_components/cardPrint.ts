import { IVoucherCard, CardStatus } from "@/lib/types";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

// ─── Gradients (match VoucherCardDisplay) ─────────────────────────────────────
const GRADIENTS: Record<CardStatus, string> = {
  [CardStatus.ACTIVE]: "linear-gradient(135deg, #059669 0%, #166534 100%)",
  [CardStatus.SUSPENDED]: "linear-gradient(135deg, #eab308 0%, #ea580c 100%)",
  [CardStatus.BLOCKED]: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
  [CardStatus.DEACTIVATED]: "linear-gradient(135deg, #6b7280 0%, #374151 100%)",
};

const STATUS_OVERLAYS: Partial<Record<CardStatus, string>> = {
  [CardStatus.SUSPENDED]: "SUSPENDED",
  [CardStatus.BLOCKED]: "BLOCKED",
  [CardStatus.DEACTIVATED]: "DEACTIVATED",
};

const formatPan = (pan: string) => pan.replace(/(.{4})/g, "$1 ").trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Prints a single voucher card sized to a physical card (85.6 × 53.98 mm).
 * Opens a dedicated window containing only the card and triggers the OS print dialog.
 */
export function printVoucherCard(card: IVoucherCard) {
  const restaurantName = (card as any).restaurant?.name ?? card.restaurantName ?? "Restaurant";
  const pan = formatPan(card.pan);
  const issuedDate = card.issuedDate
    ? new Date(card.issuedDate).toLocaleDateString()
    : "";
  const gradient = GRADIENTS[card.status] ?? GRADIENTS[CardStatus.ACTIVE];
  const overlay = STATUS_OVERLAYS[card.status];

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Voucher Card — ${escapeHtml(restaurantName)}</title>
<style>
  @page {
    size: 85.6mm 53.98mm;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 85.6mm;
    height: 53.98mm;
    overflow: hidden;
    background: #ffffff;
  }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    color: #ffffff;
    font-family: "Helvetica Neue", Arial, sans-serif;
    overflow: hidden;
    background: ${gradient};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.10); }
  .circle-1 { top: -40px; right: -40px; width: 160px; height: 160px; }
  .circle-2 { bottom: -34px; left: -34px; width: 132px; height: 132px; }

  /* Top row */
  .top { position: absolute; top: 14px; left: 18px; right: 18px; display: flex; justify-content: space-between; align-items: center; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand-logo { width: 20px; height: 20px; border-radius: 50%; background: #ffffff; object-fit: cover; }
  .brand-name { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.65); line-height: 1; }
  .brand-sub { font-size: 7px; color: rgba(255,255,255,0.4); white-space: nowrap; line-height: 1; }

  .waves { display: flex; align-items: center; gap: 6px; }
  .waves svg { color: rgba(255,255,255,0.7); transform: rotate(180deg); }
  .chip { width: 36px; height: 28px; border-radius: 4px; background: rgba(253,224,71,0.92); display: flex; align-items: center; justify-content: center; }
  .chip-inner { width: 24px; height: 20px; border-radius: 3px; border: 1px solid rgba(202,138,4,0.4); display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 3px; }
  .chip-cell { background: rgba(202,138,4,0.5); border-radius: 2px; }

  /* PAN */
  .pan {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 44%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pan-number { font-size: 15px; font-family: "Courier New", monospace; letter-spacing: 3.5px; font-weight: 600; }

  /* Bottom row */
  .bottom { position: absolute; left: 18px; right: 18px; bottom: 14px; display: flex; align-items: flex-end; justify-content: space-between; }
  .holder-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px; }
  .holder-name { font-size: 11px; font-weight: 600; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .issued-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); margin-bottom: 2px; }
  .issued-value { font-size: 11px; font-weight: 600; text-align: right; }
  .fruit { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }

  /* Status overlay */
  .overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .overlay span {
    background: rgba(0,0,0,0.4);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 5px 24px;
    border-radius: 999px;
    transform: rotate(-12deg);
  }
</style>
</head>
<body>
  <div class="card">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>

    <div class="top">
      <div class="brand">
        <img class="brand-logo" src="${FOOD_BUNDLES_LOGO}" alt="Food Bundles Logo" />
        <div>
          <p class="brand-name">Food Bundles Card</p>
          <p class="brand-sub">Apply to access voucher</p>
        </div>
      </div>
      <div class="waves">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="20" height="20">
          <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
          <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
          <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
          <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
        </svg>
        <div class="chip">
          <div class="chip-inner">
            <div class="chip-cell"></div><div class="chip-cell"></div>
            <div class="chip-cell"></div><div class="chip-cell"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="pan">
      <span class="pan-number">${escapeHtml(pan)}</span>
    </div>

    <div class="bottom">
      <div>
        <p class="holder-label">Card Holder</p>
        <p class="holder-name">${escapeHtml(restaurantName)}</p>
      </div>
      <div>
        <p class="issued-label">Issued</p>
        <p class="issued-value">${escapeHtml(issuedDate)}</p>
      </div>
      <div class="fruit">🍉</div>
    </div>

    ${overlay ? `<div class="overlay"><span>${overlay}</span></div>` : ""}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=320");
  if (!win) {
    alert("Please allow pop-ups to print the voucher card.");
    return;
  }
  win.document.write(html);
  win.document.close();

  const img = win.document.querySelector("img");
  let printed = false;
  const doPrint = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
    window.setTimeout(() => win.close(), 2000);
  };

  if (img) {
    if (img.complete) {
      window.setTimeout(doPrint, 250);
    } else {
      img.onload = () => window.setTimeout(doPrint, 250);
      img.onerror = () => window.setTimeout(doPrint, 250);
    }
  } else {
    window.setTimeout(doPrint, 250);
  }
}