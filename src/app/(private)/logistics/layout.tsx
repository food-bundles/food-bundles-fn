import { LogisticsHeader } from "./_components/logistics-header";

export default async function LogisticsLayout({ children }: { children: React.ReactNode }) {
    
    return (
        <div className="min-h-screen bg-gray-50">
            <LogisticsHeader />
            {children}
        </div>
    );
}
