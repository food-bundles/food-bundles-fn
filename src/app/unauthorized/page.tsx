/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Unauthorized() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login13");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="p-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <Image
                src="/imgs/401-vector.svg"
                alt="Logo"
                width={100}
                height={100}
              />
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-[#EF4444] font-[family-name:var(--font-playfair)]">
                401
              </h1>
              <h2 className="text-2xl font-semibold text-foreground font-[family-name:var(--font-playfair)]">
                Access Denied
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-[family-name:var(--font-source-sans)]">
            You don't have permission to access this resource. Please log in
            with an authorized account or contact support if you believe this is
            an error.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 font-[family-name:var(--font-source-sans)] bg-transparent cursor-pointer text-green-500 border border-green-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={handleLogin}
              className="flex items-center gap-2 font-[family-name:var(--font-source-sans)] bg-green-500 hover:bg-green-600 text-white"
            >
              Login
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2 font-[family-name:var(--font-source-sans)] bg-transparent cursor-pointer text-green-500 border border-green-500"
            >
              Go Home
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
