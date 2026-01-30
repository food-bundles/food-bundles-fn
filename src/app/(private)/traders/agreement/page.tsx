/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import AgreementCheckbox from "./_components/AgreementCheckbox";
import { useRouter } from "next/navigation";

export default function TraderAgreementPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user already accepted agreement
    const accepted = localStorage.getItem("traderAgreementAccepted") === "true";
    if (accepted) {
      router.push("/traders");
    }
  }, [router]);

  if (!isClient) {
    return null; 
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="fixed left-0 top-0 w-30 h-screen bg-green-700 z-40">
        <div className="absolute top-8 left-6 hidden lg:grid grid-cols-4 gap-3 pointer-events-none">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-6 hidden lg:grid grid-cols-4 gap-3 pointer-events-none z-50">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-green-700 rounded-full opacity-70"
          />
        ))}
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <article className="prose prose-sm max-w-none space-y-4">
          {/* Header */}
          <div className="text-center p-4 space-y-2 bg-green-700">
            <h1 className="text-xl text-white font-bold">
              Digital Food Store Owner Agreement
            </h1>
          </div>

          {/* Introduction */}
          <section className="space-y-3">
            <p className="text-sm">
              This <strong>Digital Food Store Owner Agreement</strong> (the
              "Agreement") is entered into as of signing up on platform [Insert
              Effective Date] (the "Effective Date"), by and between:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm marker:font-bold ml-5">
              <li>
                <strong>Food Bundles Ltd</strong>, a company operating the Food
                Bundles platform under the laws of the Republic of Rwanda, with
                its principal place of business in Kigali, Rwanda, accessible at
                <span className="text-blue-700 pl-1">www.food.rw</span> and
                related official URLs (
                <span className="font-semibold">
                  "Platform", "Food Bundles", "we", "us", or "our"
                </span>{" "}
                ); and
              </li>
              <li>
                <strong>The Digital Food Store Owner</strong>, an individual or
                entity registered on the Platform with the username [Insert
                Username] and contact information provided during registration (
                <span className="font-semibold">"Store Owner"</span> or{" "}
                <span className="font-semibold">"you</span>).
              </li>
            </ol>
            <p className="text-sm">
              This Agreement governs your participation as a Digital Food Store
              Owner on the Platform. The Digital Food Store is a dedicated
              section of the Platform for sales to onboarded restaurants and
              similar clients who use a post-payment option (locally referred to
              as <strong>Agakaye k'amadeni</strong>, a credit-based "buy now,
              pay later" arrangement allowing deferred payment after delivery).
            </p>
            <p className="text-sm">
              By registering as a Store Owner and accepting this Agreement (via
              electronic acceptance on the Platform or continued use), you agree
              to be bound by its terms. Electronic acceptance is valid and
              binding under{" "}
              <span className="font-semibold">
                Law No. 18/2010 Relating to Electronic Messages, Electronic
                Signatures and Electronic Transactions.
              </span>{" "}
              If you do not agree, do not register or act as a Store Owner in
              the Digital Food Store.
            </p>
          </section>

          {/* Section 1: Definitions */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">1. Definitions</h2>
            <ul className="space-y-1 list-disc list-inside text-sm ml-5">
              <li>
                <strong>Approved Voucher / Order:</strong> A Voucher Request
                approved by the Store Owner (or by Food Bundles on the Store
                Owner's behalf if authorized under Section 8), enabling the
                Client to check out up to the approved value under the stated
                post-payment terms.
              </li>
              <li>
                <strong>Client:</strong> A restaurant or similar buyer onboarded
                by Food Bundles for the Digital Food Store and eligible for
                post-payment (Agakaye k'amadeni).
              </li>
              <li>
                <strong>Default:</strong> A Client payment that remains unpaid
                <span className="font-semibold">
                  {" "}
                  thirty (30) days after the due date
                </span>
                stated in the Approved Voucher/Order, excluding amounts subject
                to an active, good-faith dispute under Section 5.4.
              </li>
              <li>
                <strong>Digital Food Store:</strong> The Platform section
                dedicated to post-payment sales to qualified Clients.
              </li>
              <li>
                <strong>Earnings:</strong> Under the Standard Model, the Store
                Owner's compensation equal to the Margin Percentage applied to
                the Actual Utilized Order Value.
              </li>
              <li>
                <strong>Fixed ROI Model:</strong> An alternative compensation
                arrangement where, by mutual agreement, the Store Owner receives
                a fixed monthly return on a principal deposit instead of
                per-order Earnings.
              </li>
              <li>
                <strong>Inventory:</strong> The aggregate pool of fresh food
                products (e.g., fruits, vegetables, produce) sourced, stored,
                handled, and delivered by Food Bundles for the Digital Food
                Store.
              </li>
              <li>
                <strong>Margin Percentage (Commission):</strong> The fixed
                percentage of the{" "}
                <span className="font-semibold">
                  {" "}
                  Actual Utilized Order Value
                </span>{" "}
                that constitutes Earnings under the Standard Model.
              </li>
              <li>
                <strong>Platform Commission:</strong> The fee (currently{" "}
                <span className="font-semibold">5%</span>, or such other rate as
                notified under Section 3.6) deducted by Food Bundles from
                Earnings at payout under the Standard Model.
              </li>
              <li>
                <strong>Store Owner Wallet:</strong> The dashboard balance
                showing pending/realized Earnings (or Fixed ROI accruals),
                transaction history, and Voucher status.
              </li>
              <li>
                <strong>Voucher Request:</strong> A request initiated by a
                Client specifying a monetary limit and deferred payment terms.
              </li>
              <li>
                <strong>Voucher Validity Window:</strong> The period during
                which a Client may use an Approved Voucher to check out, as
                defined in Section 2.4.
              </li>
            </ul>
          </section>

          {/* Section 2: Platform Operations */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              2. Platform Operations and Store Owner Role
            </h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">
                  2.1 Inventory, Title, and Fulfillment
                </h3>
                <p className="text-sm">
                  Food Bundles exclusively sources, manages, stores, handles,
                  and delivers all Inventory in the Digital Food Store.{" "}
                  <span className="font-semibold">
                    Store Owners do not purchase, hold, or take title to
                    Inventory. Title to Inventory remains with Food Bundles
                    until delivery to the Client (or as otherwise required by
                    applicable law).
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  2.2 Client Onboarding and Credit Assessment
                </h3>
                <p className="text-sm">
                  Food Bundles exclusively onboards Clients for the Digital Food
                  Store and performs creditworthiness assessments before Voucher
                  Requests are issued to Store Owners.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">2.3 Voucher Decisions</h3>
                <p className="text-sm">
                  Participation in the Digital Food Store is limited to
                  reviewing and approving or rejecting Voucher Requests for
                  post-payment purchases. Unless you authorize Food Bundles to
                  manage approvals on your behalf under Section 8, you have
                  discretion to approve or reject Voucher Requests.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  2.4 Voucher Validity and Utilization
                </h3>
                <p className="text-sm">
                  An Approved Voucher may be used by the Client to check out
                  <span className="font-semibold">
                    within twelve (12) hours from the time of approval (the
                    "Voucher Validity Window")
                  </span>
                  . If the Client does not check out within the Voucher Validity
                  Window, the voucher expires and no Earnings are credited for
                  that voucher.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  2.5 Order Process and Wallet Posting
                </h3>
                <p className="text-sm">
                  Upon checkout by the Client, the{" "}
                  <span className="font-semibold">
                    Actual Utilized Order Value
                  </span>
                  is recorded and reflected in the Store Owner Wallet as{" "}
                  <span className="font-semibold"> pending </span>
                  Earnings (Standard Model) or contributes to Fixed ROI accruals
                  (Fixed ROI Model). Food Bundles handles fulfillment, delivery,
                  invoicing, and payment collection.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">2.6 Fees</h3>
                <p className="text-sm">
                  No upfront transaction or platform fees are charged to Store
                  Owners. Under the Standard Model, the Platform Commission is
                  deducted <span className="font-semibold">only at payout</span>{" "}
                  of Earnings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Compensation Models */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">3. Compensation Models</h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">
                  3.1 Standard Model (Per-Order Margin)
                </h3>
                <p className="text-sm">
                  Unless you elect the Fixed ROI Model via Platform settings or
                  a separate written addendum, you participate under the
                  Standard Model.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  3.2 Margin Percentage Setting and Changes
                </h3>
                <p className="text-sm">
                  Food Bundles sets your Margin Percentage and will notify you
                  via dashboard and/or email. The Margin Percentage is
                  guaranteed for up to{" "}
                  <span className="font-semibold"> three (3) months</span> from
                  notification. Any change after that period applies{" "}
                  <span className="font-semibold">
                    {" "}
                    only to Voucher Requests approved after the effective date
                    of the change.
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  3.3 Earnings Calculation (Standard Model)
                </h3>
                <p className="text-sm">
                  Earnings are calculated after Voucher utilization:
                </p>
                <p className="pl-4 font-mono text-sm">
                  <strong>
                    Earnings = Actual Utilized Order Value × Margin Percentage
                  </strong>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  3.4 Fixed ROI Model (Alternative)
                </h3>
                <p className="text-sm">
                  By mutual agreement (via Platform election and/or written
                  addendum), you may opt for a Fixed ROI Model. The ROI rate,
                  calculation basis, accrual method, and conditions will be
                  specified in the election interface and/or addendum. Unless
                  expressly agreed in writing, the Fixed ROI Model{" "}
                  <span className="font-semibold"> replaces </span>
                  per-order Earnings.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  3.5 Crediting and Tracking
                </h3>
                <p className="text-sm">
                  Under either model, you have dashboard access to
                  pending/realized amounts, transaction history, and voucher
                  status.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  3.6 Payouts and Platform Commission
                </h3>
                <p className="text-sm">
                  Payouts of accumulated amounts occur{" "}
                  <span className="font-semibold"> monthly</span> to your
                  designated bank account, subject to verification and any
                  minimum thresholds communicated on the Platform.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li>
                    Under the Standard Model, Food Bundles deducts the Platform
                    Commission from Earnings at payout.
                  </li>
                  <li>
                    Food Bundles may change the Platform Commission rate with at
                    least <span className="font-semibold"> one (1) month</span>{" "}
                    prior notice via the Platform or email. Changes apply only
                    to payouts for Earnings generated after the effective date
                    of the change.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Withdrawals */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              4. Withdrawals and Principal/Deposit
            </h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">
                  4.1 Earnings / Fixed ROI Withdrawal
                </h3>
                <p className="text-sm">
                  Accumulated Earnings or Fixed ROI amounts may be withdrawn
                  monthly, subject to verification and any minimum thresholds.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  4.2 Principal/Deposit Withdrawal
                </h3>
                <p className="text-sm">
                  If a principal deposit is required for participation and/or
                  the Fixed ROI Model, it may be withdrawn upon{" "}
                  <span className="font-semibold">
                    Forty five (45) days' written notice
                  </span>{" "}
                  via the Platform, subject to:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li>
                    no active Approved Vouchers remaining within the Voucher
                    Validity Window;
                  </li>
                  <li>
                    settlement of any confirmed chargebacks, fraud findings, or
                    amounts owed by the Store Owner to Food Bundles; and
                    completion of any open disputes under Section 5.4.
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  Food Bundles may apply a reasonable holdback to cover
                  unresolved risks, but any holdback must be released once the
                  relevant risk is resolved.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">4.3 Set-Off</h3>
                <p className="text-sm">
                  Food Bundles may set off any amounts owed by the Store Owner
                  to Food Bundles against the Store Owner Wallet balance and/or
                  any deposit, to the extent permitted by law.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Payment and Defaults */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              5. Payment, Defaults, Disputes, and Liability
            </h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">5.1 Payment Collection</h3>
                <p className="text-sm">
                  Food Bundles is responsible for invoicing Clients and
                  collecting payments under Approved Vouchers/Orders.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  5.2 Default Coverage (Earnings Protection)
                </h3>
                <p className="text-sm">
                  If a Client Default occurs, Food Bundles will pay the Store
                  Owner the{" "}
                  <span className="font-semibold"> outstanding Earnings</span>{" "}
                  attributable to the Defaulted Approved Voucher/Order{" "}
                  <span className="font-semibold">
                    within thirty (30) days after the Default is confirmed
                  </span>
                  , provided that:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li>
                    The Approved Voucher/Order and delivery were verified in
                    Platform records;
                  </li>
                  <li>
                    There is no evidence of fraud, collusion, or misuse by the
                    Store Owner; and
                  </li>
                  <li>
                    The amount is not subject to an active dispute under Section
                    5.4.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  5.3 Limitations of Liability
                </h3>
                <p className="text-sm">
                  To the maximum extent permitted by applicable law, Food
                  Bundles is not liable for indirect or consequential losses
                  (including lost profits). Nothing in this Agreement limits
                  liability for fraud, willful misconduct, or gross negligence
                  where such limitation would be unenforceable under Rwandan
                  law.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  5.4 Order Disputes and Adjustments
                </h3>
                <p className="text-sm">
                  Clients may raise disputes relating to delivery, quality,
                  quantity, or pricing within the dispute window stated on the
                  Platform (or, if not stated, within a reasonable time). Food
                  Bundles will investigate in good faith.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  5.5 Store Owner Indemnity (Narrow)
                </h3>
                <p className="text-sm">
                  The Store Owner will indemnify Food Bundles against
                  third-party claims and losses arising from the Store Owner's
                  fraud, collusion, unlawful activity, breach of this Agreement,
                  or misuse of the Platform.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  5.6 Platform Provided "As Is"
                </h3>
                <p className="text-sm">
                  The Platform is provided with reasonable care and security,
                  but without warranties beyond those expressly stated in this
                  Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Representations */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              6. Representations, Responsibilities, and Compliance
            </h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">6.1 By Store Owner</h3>
                <p className="text-sm">
                  You represent that you have legal capacity and will comply
                  with applicable Rwandan laws, including tax and anti-money
                  laundering requirements, and will act in good faith when
                  making Voucher decisions.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">6.2 By Food Bundles</h3>
                <p className="text-sm">
                  Food Bundles will maintain the Platform, manage Inventory and
                  delivery professionally, onboard qualified Clients for Agakaye
                  k'amadeni, and set Margin/ROI terms transparently.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  6.3 Governing Principles
                </h3>
                <p className="text-sm">
                  This Agreement aligns with{" "}
                  <span className="font-semibold">
                    Law No. 45/2011 Governing Contracts{" "}
                  </span>
                  (including good faith and mutual assent) and electronic
                  acceptance under{" "}
                  <span className="font-semibold"> Law No. 18/2010</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Term and Termination */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">7. Term and Termination</h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">7.1 Term</h3>
                <p className="text-sm">
                  This Agreement begins on the Effective Date and continues
                  until terminated.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  7.2 Termination for Convenience
                </h3>
                <p className="text-sm">
                  Either party may terminate this Agreement with{" "}
                  <span className="font-semibold">
                    Forty five (45) days' notice.
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  7.3 Termination for Cause
                </h3>
                <p className="text-sm">
                  Food Bundles may terminate immediately for material breach,
                  including fraud, collusion, or serious misuse of the Platform.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">
                  7.4 Settlement on Termination
                </h3>
                <p className="text-sm">Upon termination, the parties will:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li>
                    allow pending Approved Vouchers to expire or be completed
                    within the Voucher Validity Window unless otherwise agreed;
                  </li>
                  <li>
                    settle verified Earnings/ROI amounts in the next monthly
                    payout cycle (or within a reasonable period not exceeding
                    <span className="font-semibold"> sixty (60) days</span> );
                    and
                  </li>
                  <li>
                    process any eligible deposit withdrawal subject to Section
                    4.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8: Account Management */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              8. Account Management by Food Bundles
            </h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">8.1 Request Process</h3>
                <p className="text-sm">
                  You may request through the Platform for Food Bundles to
                  manage specified aspects of your account, including
                  approving/rejecting Voucher Requests based on criteria you
                  define.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">8.2 Authorization</h3>
                <p className="text-sm">
                  By submitting and confirming such a request, you grant Food
                  Bundles a limited, revocable authorization to act on your
                  behalf solely for the specified tasks. You may revoke
                  authorization via the Platform, effective upon confirmation.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">8.3 Standard of Care</h3>
                <p className="text-sm">
                  Food Bundles will exercise reasonable care when managing your
                  account. Food Bundles is not liable for losses arising from
                  market changes, Client disputes, or force majeure unless due
                  to fraud, willful misconduct, or gross negligence.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Dispute Resolution */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              9. Governing Law and Dispute Resolution
            </h2>

            <p className="text-sm">
              This Agreement is governed by the laws of the Republic of Rwanda.
            </p>
            <p className="text-sm">
              The parties will first attempt amicable resolution. If unresolved
              within <span className="font-semibold">Sixty (60) days</span> of
              written notice of dispute, the dispute will be referred to{" "}
              <span className="font-semibold">
                arbitration seated in Kigali, Rwanda,
              </span>{" "}
              unless the parties mutually agree otherwise in writing.
            </p>
          </section>

          {/* Section 10: Miscellaneous */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">10. Miscellaneous</h2>

            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-base">10.1 Amendments</h3>
                <p className="text-sm">
                  Food Bundles may update this Agreement with notice via the
                  Platform or email. Continued use constitutes acceptance of
                  non-material updates.{" "}
                  <span className="font-semibold">
                    {" "}
                    Changes to compensation models, default coverage terms, or
                    account-management authorization require your explicit
                    consent via the Platform or a written agreement.
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">10.2 Force Majeure</h3>
                <p className="text-sm">
                  Neither party is liable for failure to perform due to events
                  beyond reasonable control.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base">10.3 Entire Agreement</h3>
                <p className="text-sm">
                  This Agreement supersedes prior understandings regarding the
                  Digital Food Store, except where a separate written addendum
                  for the Fixed ROI Model or other specific terms is executed.
                </p>
              </div>
            </div>
          </section>

          {/* Agreement Checkbox */}
          <AgreementCheckbox />
        </article>
      </div>
    </main>
  );
}