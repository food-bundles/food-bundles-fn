// "use client";

// import { useEffect, useState } from "react";

// interface ClientWrapperProps {
//   children: React.ReactNode;
// }

// export function ClientWrapper({ children }: ClientWrapperProps) {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) {
//     return <div className="min-h-[400px]" />;
//   }

//   return <div suppressHydrationWarning>{children}</div>;
// }