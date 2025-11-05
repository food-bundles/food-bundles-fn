import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";
import { LogisticsHeader } from "./_components/logistics-header";

export default async function LogisticsLayout({ children }: { children: React.ReactNode }) {
    await roleGuard([UserRole.LOGISTICS]);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <LogisticsHeader />
            {children}
        </div>
    );
}
