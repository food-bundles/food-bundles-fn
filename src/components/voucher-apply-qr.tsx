"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Download, ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOOD_BUNDLES_LOGO } from "@/components/food-bundles-card";

const PRINT_TARGET_ID = "voucher-apply-qr-print";

interface VoucherApplyQrProps {
  size?: number;
  showActions?: boolean;
  className?: string;
}

export function VoucherApplyQr({
  size = 220,
  showActions = true,
  className = "",
}: VoucherApplyQrProps) {
  const [url, setUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const configuredUrl = process.env.NEXT_PUBLIC_VOUCHER_APPLY_URL;
    setUrl(configuredUrl || `${window.location.origin}/apply-voucher`);
  }, []);

  const downloadSvg = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const source = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "foodbundles-voucher-apply-qr.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className={className}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #${PRINT_TARGET_ID}, #${PRINT_TARGET_ID} * { visibility: visible; }
          #${PRINT_TARGET_ID} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: 0 !important;
          }
          .voucher-qr-no-print { display: none !important; }
        }
      `}</style>

      <div
        id={PRINT_TARGET_ID}
        className="mx-auto w-full max-w-sm rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <Image
            src={FOOD_BUNDLES_LOGO}
            alt="Food Bundles"
            width={32}
            height={32}
            className="rounded-full bg-white object-cover"
            crossOrigin="anonymous"
          />
          <div className="text-left">
            <p className="text-sm font-bold text-green-800">FoodBundles</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              Voucher Application
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900">
          Apply for your voucher card
        </h3>

        <div className="mt-5 flex justify-center">
          {url ? (
            <div ref={qrRef} className="rounded-xl border border-gray-100 bg-white p-3">
              <QRCode
                value={url}
                size={size}
                level="M"
                bgColor="#ffffff"
                fgColor="#065f46"
              />
            </div>
          ) : (
            <div
              className="animate-pulse rounded-xl bg-gray-100"
              style={{ width: size + 24, height: size + 24 }}
            />
          )}
        </div>

        {url && (
          <p className="mt-4 break-all text-[10px] font-medium text-green-700">{url}</p>
        )}

        <p className="mt-3 text-[10px] text-gray-400">
          No account yet? Create one in a few minutes — no app download required.
        </p>
      </div>

      {showActions && (
        <div className="voucher-qr-no-print mx-auto mt-4 flex w-full max-w-sm flex-wrap justify-center gap-2">
          <Button type="button" variant="green" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print QR
          </Button>
          <Button type="button" variant="outline" onClick={downloadSvg} disabled={!url}>
            <Download className="h-4 w-4" />
            Download SVG
          </Button>
          {url && (
            <Button type="button" variant="ghost" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open link
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
