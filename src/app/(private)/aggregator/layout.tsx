// SubmissionProvider;

import { SubmissionProvider } from "@/app/contexts/submission-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  return (
    <SubmissionProvider>
      <main className="grow overflow-auto min-h-0">
        <div className="container mx-auto max-w-full">{children}</div>
      </main>
    </SubmissionProvider>
  );
}
