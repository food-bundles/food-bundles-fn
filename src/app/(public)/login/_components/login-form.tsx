"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ILoginData } from "@/lib/types";
import { authService } from "@/app/services/authService";

type Props = {
  loginData: {
    isBackendAvailable: boolean;
    message?: string;
  };
};

export function LoginForm({ loginData }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function isValidPhone(phone: string) {
    return /^\+?[0-9]{10,15}$/.test(phone);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

     if (!identifier.includes("@") && !isValidPhone(identifier)) {
       setError(
         "Invalid phone number. It must be 10–15 digits and can start with '+'."
       );
       setIsLoading(false);
       return;
     }

    let loginPayload: ILoginData;
    if (identifier.includes("@")) {
      loginPayload = { email: identifier.toLowerCase(), password };
    } else {
      loginPayload = { phone: identifier, password };
    }

    try {
      const response = await authService.login(loginPayload);

      const redirectPath =
        response.user?.role === "farmer"
          ? "/farmer"
          : "/restaurant";
      router.push(redirectPath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || error.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-xl border-0">
      <CardHeader className="text-center pb-2">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600 text-sm">Sign in to your account</p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!loginData.isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            {loginData.message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              name="identifier" 
              placeholder="Email or Phone"
              className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
              disabled={!loginData.isBackendAvailable}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
              disabled={!loginData.isBackendAvailable}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={!loginData.isBackendAvailable}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-green-600 hover:text-green-700"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            disabled={isLoading || !loginData.isBackendAvailable}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
            or continue with
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 border-gray-300"
          type="button"
          disabled={!loginData.isBackendAvailable}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          {"Don't have an account? "}
          <Link
            href="/signup"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
