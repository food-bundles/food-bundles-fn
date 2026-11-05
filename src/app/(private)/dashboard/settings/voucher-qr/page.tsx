import { Printer, QrCode, Share2 } from "lucide-react";
import { VoucherApplyQr } from "@/components/voucher-apply-qr";

export default function VoucherQrSettingsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-green-700">
            <QrCode className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Dashboard settings
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Voucher Application QR</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Print this QR code and place it at the counter. Restaurants can scan it to
            create an account, apply for a voucher card, accept the terms, and request
            financing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <VoucherApplyQr size={240} />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Printer className="h-4 w-4 text-green-700" />
                <h2 className="text-sm font-semibold text-gray-900">How to use it</h2>
              </div>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    1
                  </span>
                  Click <span className="font-medium text-gray-900">Print QR</span> and
                  place the printed card where restaurant owners can see it.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    2
                  </span>
                  They scan the code with a phone camera and open the voucher
                  application page.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    3
                  </span>
                  New restaurants create an account; returning restaurants sign in.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    4
                  </span>
                  After signing in they are returned to the card application, then can
                  accept the terms and request financing.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
              <div className="flex items-start gap-3">
                <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Share the link digitally too
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-green-700">
                    The QR points to your public voucher application page. You can also
                    paste the link below the QR into WhatsApp, SMS, or social media for
                    restaurants that are not on site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
