import { IVoucherCard, CardStatus } from "@/lib/types";
import html2canvas from "html2canvas";

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

// Deterministic 3-digit CVV derived from the PAN (no secret stored on the card)
const deriveCvv = (pan: string) => {
  let hash = 0;
  for (let i = 0; i < pan.length; i++) {
    hash = (hash * 31 + pan.charCodeAt(i)) % 997;
  }
  return String(100 + (hash % 900));
};

function buildCardHtml(card: IVoucherCard): string {
  const restaurantName =
    (card as { restaurant?: { name?: string } }).restaurant?.name ??
    card.restaurantName ??
    "Restaurant";
  const pan = formatPan(card.pan);
  const cvv = deriveCvv(card.pan);
  const issuedDate = card.issuedDate
    ? new Date(card.issuedDate).toLocaleDateString()
    : "";
  const gradient = GRADIENTS[card.status] ?? GRADIENTS[CardStatus.ACTIVE];
  const overlay = STATUS_OVERLAYS[card.status];

  return `<!DOCTYPE html>
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
    margin: 0;
    background: #ffffff;
  }
  .card {
    position: relative;
    width: 100%;
    height: 53.98mm;
    border-radius: 12px;
    color: #ffffff;
    font-family: "Helvetica Neue", Arial, sans-serif;
    overflow: hidden;
    background: ${gradient};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    page-break-after: always;
  }
  .card:last-child { page-break-after: auto; }
  .circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.10); }
  .circle-1 { top: -40px; right: -40px; width: 160px; height: 160px; }
  .circle-2 { bottom: -34px; left: -34px; width: 132px; height: 132px; }

  /* Top row */
  .top { position: absolute; top: 14px; left: 18px; right: 18px; display: flex; justify-content: space-between; align-items: center; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand-logo { width: 20px; height: 20px; border-radius: 50%; background: #ffffff; object-fit: cover; }
  .brand-name { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.65); line-height: 1; }
  .brand-sub { font-size: 7px; color: rgba(255,255,255,0.4); white-space: nowrap; line-height: 1; margin-top: 4px; }

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

  /* ── Back face ────────────────────────────────────────────────────── */
  .card-back {
    background: linear-gradient(135deg, #268b69 0%, #126044 55%, #0b4935 100%);
    color: #ffffff;
    border: 1px solid #0b4935;
  }
  .card-back .stripe {
    position: absolute; top: 0; left: 0; right: 0; height: 13mm;
    background: rgba(0,0,0,0.82);
  }
  .card-back::after { content: ""; position: absolute; right: -16mm; bottom: -24mm; width: 48mm; height: 48mm; border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; }
  .card-back .back-msg {
    position: absolute; top: 16mm; left: 6mm; right: 6mm;
    text-align: center;
  }
  .back-msg-highlight {
    display: inline-block;
    font-size: 3mm;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: 0.2px;
    color: #ffffff;
  }
  .back-msg-text {
    margin-top: 1mm;
    font-size: 2.2mm;
    line-height: 1.55;
    color: rgba(255,255,255,0.7);
  }
  .card-back .sig {
    position: absolute; left: 7mm; right: 7mm; bottom: 5mm;
    display: flex; align-items: center; justify-content: space-between;
    background: #f4f0e7;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 2mm;
    padding: 2.6mm 4mm 2.6mm 4mm;
  }
  .card-back .sig .brand { display: flex; align-items: center; gap: 8px; }
  .card-back .sig .brand-logo {
    width: 20px; height: 20px; border-radius: 50%;
    background: #ffffff; object-fit: cover; border: 1px solid #d1d5db;
  }
  .card-back .sig .brand-name {
    font-size: 9px; text-transform: uppercase; letter-spacing: 3px;
    color: #111827; line-height: 1;
  }
  .card-back .sig .brand-sub {
    font-size: 7px; color: #6b7280; line-height: 1; margin-top: 4px; white-space: nowrap;
  }
  .card-back .cvv {
    background: #ffffff; border: 1px solid #e5e7eb;
    border-radius: 1.5mm; padding: 1.6mm 3.2mm; text-align: center;
  }
  .cvv-label {
    font-size: 1.8mm; text-transform: uppercase; letter-spacing: 1px;
    color: #6b7280; text-align: left;
  }
  .cvv-value {
    font-family: "Courier New", monospace;
    font-size: 3.6mm; font-weight: 700; letter-spacing: 1.5px; color: #111827; text-align: center;
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
          <p class="brand-sub">Your Supply, Always Secured</p>
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
    </div>

    ${overlay ? `<div class="overlay"><span>${overlay}</span></div>` : ""}
  </div>

  <div class="card card-back">
    <div class="stripe"></div>
    <div class="back-msg">
      <span class="back-msg-highlight">Backed by Food Bundles. Trusted Across Our Market.</span>
      <p class="back-msg-text">This card guarantees supply not debt. Use it to grow.</p>
      <p class="back-msg-text">This card is property of Food Bundles Limited, for use exclusively on the Food Bundles platform and with authorized partners. Not a bank card.</p>
    </div>
    <div class="sig">
      <div class="brand">
        <img class="brand-logo" src="${FOOD_BUNDLES_LOGO}" alt="Food Bundles Logo" />
        <div>
          <p class="brand-name">Food Bundles Card</p>
          <p class="brand-sub">Your Supply, Always Secured</p>
        </div>
      </div>
      <div class="cvv">
        <p class="cvv-label">CVV</p>
        <p class="cvv-value">${escapeHtml(cvv)}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Prints a voucher card sized to a physical card (85.6 × 53.98 mm).
 * Opens a dedicated window containing the front (page 1) and back (page 2)
 * of the card, then triggers the OS print dialog.
 */
export function printVoucherCard(card: IVoucherCard) {
  const html = buildCardHtml(card);

  const win = window.open("", "_blank", "width=420,height=320");
  if (!win) {
    alert("Please allow pop-ups to print the voucher card.");
    return;
  }
  win.document.write(html);
  win.document.close();

  const imgs = Array.from(win.document.querySelectorAll("img"));
  let printed = false;
  const doPrint = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
    window.setTimeout(() => win.close(), 2000);
  };

  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) {
    window.setTimeout(doPrint, 250);
  } else {
    let remaining = pending.length;
    const check = () => {
      remaining -= 1;
      if (remaining === 0) window.setTimeout(doPrint, 250);
    };
    pending.forEach((img) => {
      img.addEventListener("load", check, { once: true });
      img.addEventListener("error", check, { once: true });
    });
    window.setTimeout(check, 5000); // safety fallback
  }
}

const waitForImages = (doc: Document) =>
  new Promise<void>((resolve) => {
    const imgs = Array.from(doc.querySelectorAll("img"));
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) {
      window.setTimeout(resolve, 150);
      return;
    }
    let remaining = pending.length;
    const check = () => {
      remaining -= 1;
      if (remaining === 0) window.setTimeout(resolve, 150);
    };
    pending.forEach((img) => {
      img.addEventListener("load", check, { once: true });
      img.addEventListener("error", check, { once: true });
    });
    window.setTimeout(check, 5000); // safety fallback
  });

const renderCardCanvas = async (el: HTMLElement) => {
  const canvas = await html2canvas(el, {
    scale: 4,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  return canvas;
};

/**
 * Exports the voucher card (front + back) as a JPG/PNG image or a 2-page PDF,
 * sized to a physical card (85.6 × 53.98 mm).
 */
export async function exportVoucherCard(
  card: IVoucherCard,
  format: "png" | "jpg" | "pdf",
) {
  const win = window.open("", "_blank", "width=680,height=760");
  if (!win) {
    alert("Please allow pop-ups to export the voucher card.");
    return;
  }
  win.document.write(buildCardHtml(card));
  win.document.close();

  try {
    await waitForImages(win.document);

    const front = win.document.querySelector<HTMLElement>(".card");
    const back = win.document.querySelector<HTMLElement>(".card-back");
    const suffix = card.pan.slice(-4);
    const fileName = `food-bundles-card-${suffix}`;

    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98],
      });
      if (front) {
        const canvas = await renderCardCanvas(front);
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 85.6, 53.98);
      }
      pdf.addPage([85.6, 53.98], "landscape");
      if (back) {
        const canvas = await renderCardCanvas(back);
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 85.6, 53.98);
      }
      pdf.save(`${fileName}.pdf`);
      return;
    }

    if (!front || !back) return;
    const frontCanvas = await renderCardCanvas(front);
    const backCanvas = await renderCardCanvas(back);
    const gap = 16;
    const combined = document.createElement("canvas");
    combined.width = frontCanvas.width;
    combined.height = frontCanvas.height + gap + backCanvas.height;
    const ctx = combined.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, combined.width, combined.height);
    ctx.drawImage(frontCanvas, 0, 0);
    ctx.drawImage(backCanvas, 0, frontCanvas.height + gap);

    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const link = document.createElement("a");
    link.href = combined.toDataURL(mime, 0.95);
    link.download = `${fileName}.${format}`;
    link.click();
  } finally {
    win.close();
  }
}