import { Utensils } from "lucide-react";
import { LoginForm } from "./_components/login-form";
import Link from "next/link";

async function getLoginData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
      cache: "no-store",
    });
    if (res.ok) {
      return { isBackendAvailable: true };
    }
    return { isBackendAvailable: false, message: "Backend unavailable" };
  } catch {
    return { isBackendAvailable: false, message: "Backend unavailable" };
  }
}
export default async function LoginPage() {
  const loginData = await getLoginData();

  return (
    <>
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="w-1/2 bg-gradient-to-br from-green-600 to-green-700 flex flex-col justify-center items-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white/20 rounded-full"></div>
          </div>

          <div className="absolute top-8 left-8">
            <p className="text-white/70 text-sm">
              <Link href="/" className="hover:underline">
                Home
              </Link>{" "}
              <span className="mx-2">›</span> Login
            </p>
          </div>

          <div className="text-center text-white z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl font-light">Welcome to</span>
              <div className="flex items-center gap-2">
                <Utensils className="h-8 w-8 text-green-400" />
                <h1 className="text-2xl font-bold">Food Bundle</h1>
              </div>
            </div>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">
              Connect with sustainable food producers and discover fresh, local
              ingredients for your business.
            </p>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <LoginForm loginData={loginData} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
