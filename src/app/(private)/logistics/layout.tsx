import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";

export default async function LogisticsLayout({ children }: { children: React.ReactNode }) {
    await roleGuard([UserRole.LOGISTICS]);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-3">
                    <h1 className="text-xl font-semibold text-gray-900">Logistics Management</h1>
                </div>
            </div>
            {children}
        </div>
    );
}
