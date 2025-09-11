// SubmissionProvider;

import { SubmissionProvider } from "@/app/contexts/submission-context";
import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-unused-vars */

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  const user = await roleGuard([ UserRole.AGGREGATOR]);
  return (
    <SubmissionProvider>
      <main className="flex-grow overflow-auto min-h-0">
        <div className="container mx-auto max-w-full px-4">{children}</div>
      </main>
    </SubmissionProvider>
  );
}
