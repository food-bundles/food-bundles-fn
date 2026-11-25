"use client";

/** Saves the menu page as an A4 PDF (several pages when the menu is long) */
export async function exportMenuPdf(page: HTMLElement, fileName: string, background = "#ffffff") {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  await page.ownerDocument.fonts?.ready;
  const canvas = await html2canvas(page, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    windowWidth: page.scrollWidth,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidthMm = 210;
  const pageHeightMm = 297;
  // Canvas pixels that fit on one A4 page
  const sliceHeight = Math.floor((canvas.width * pageHeightMm) / pageWidthMm);
  const slice = document.createElement("canvas");
  slice.width = canvas.width;
  const ctx = slice.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  for (let y = 0, index = 0; y < canvas.height; y += sliceHeight, index += 1) {
    const h = Math.min(sliceHeight, canvas.height - y);
    slice.height = h;
    ctx.clearRect(0, 0, slice.width, h);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    if (index > 0) pdf.addPage();
    // The menu's own background under the whole page (a short last page stays dark on dark designs)
    pdf.setFillColor(background);
    pdf.rect(0, 0, pageWidthMm, pageHeightMm, "F");
    pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageWidthMm, (h * pageWidthMm) / canvas.width);
  }
  pdf.save(`${fileName.replace(/[^\w\- ]+/g, "").trim() || "menu"}.pdf`);
}
