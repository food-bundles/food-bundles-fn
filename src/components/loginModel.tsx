/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ILoginData, UserRole } from "@/lib/types";
import { authService } from "@/app/services/authService";
import { useCart } from "@/app/contexts/cart-context";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  loginData: {
    isBackendAvailable: boolean;
    message?: string;
  };
};

export function LoginModal({ isOpen, onClose, loginData }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { refreshCart } = useCart();

  useEffect(() => {
    const storedProduct = localStorage.getItem("pendingCartProduct");
    if (storedProduct) {
      setPendingProduct(JSON.parse(storedProduct));
    }

    const storedRedirect = localStorage.getItem("pendingRedirect");
    if (storedRedirect) {
      setPendingRedirect(storedRedirect);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsNavigating(false);
    }
  }, [isOpen]);

  function isValidPhone(phone: string) {
    return /^\+?[0-9]{10,15}$/.test(phone);
  }

  function getRedirectPath(userRole: UserRole): string {
    switch (userRole) {
      case UserRole.FARMER:
        return "/farmer";
      case UserRole.RESTAURANT:
        return "/restaurant";
      case UserRole.AGGREGATOR:
        return "/aggregator";
      case UserRole.ADMIN:
      case UserRole.LOGISTIC:
        return "/dashboard";
      default:
        console.warn(
          `Unknown user role: ${userRole}. Redirecting to default path.`
        );
        return "/dashboard";
    }
  }

  const handleClose = () => {
    if (isNavigating) return;

    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setError("");
      setShowPassword(false);
    }, 300);
  };

  const addProductToCart = async (product: any, token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            price: product.price,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const handleNavigation = async (path: string) => {
    setIsNavigating(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push(path);
  };

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

      if (pendingProduct) {
        try {
          await addProductToCart(pendingProduct, response.data.token);
          console.log("Adding product to cart:", pendingProduct);
          localStorage.removeItem("pendingCartProduct");
          setPendingProduct(null);

          await refreshCart();

          const returnUrl = localStorage.getItem("returnUrl");
          if (returnUrl) {
            localStorage.removeItem("returnUrl");
            await handleNavigation(returnUrl);
            return;
          }
        } catch (cartError) {
          console.error("Cart error:", cartError);
        }
      }

      if (pendingRedirect) {
        localStorage.removeItem("pendingRedirect");
        setPendingRedirect(null);
        await handleNavigation(pendingRedirect);
        return;
      }

      const userRole = response.data?.user?.role;
      if (userRole) {
        const redirectPath = getRedirectPath(userRole as UserRole);
        await handleNavigation(redirectPath);
      } else {
        setError("User role not found. Please contact support.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || error.message || "Login failed"
      );
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const getButtonText = () => {
    if (isNavigating) return "Please wait...";
    if (isLoading) return "logging in...";
    if (pendingProduct) return "LOG IN";
    if (pendingRedirect) return "LOG IN";
    return "LOG IN";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={isNavigating ? undefined : handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 -translate-x-full"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex">
          <div className="w-1/2 bg-green-700 text-white p-8 flex flex-col justify-center relative">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Login</h2>
              <p className="text-green-100 text-lg">
                Get access to your Orders,
                <br />
                Wishlist and Recommendations.
              </p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-1/2 p-8 relative">
            {/* Close Button */}
            <button
              onClick={isNavigating ? undefined : handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isNavigating}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mt-8">
              {!loginData.isBackendAvailable && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-4">
                  {loginData.message}
                </div>
              )}

              {loginData.message && loginData.isBackendAvailable && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm mb-4">
                  {loginData.message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    name="identifier"
                    placeholder="Enter Email, phone, TIN number"
                    className="w-full h-12 pl-4 pr-4 border border-gray-300 rounded-md focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    required
                    disabled={!loginData.isBackendAvailable || isNavigating}
                  />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    className="w-full h-12 pl-4 pr-12 border border-gray-300 rounded-md focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    required
                    disabled={!loginData.isBackendAvailable || isNavigating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={!loginData.isBackendAvailable || isNavigating}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-700 border-gray-300 rounded focus:ring-green-700"
                      disabled={isNavigating}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-green-700 hover:text-green-800"
                    onClick={
                      isNavigating ? (e) => e.preventDefault() : undefined
                    }
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-700 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center gap-2"
                  disabled={
                    isLoading || !loginData.isBackendAvailable || isNavigating
                  }
                >
                  {isNavigating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {getButtonText()}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {"Don't have an account? "}
                  <Link
                    href="/signup"
                    className="text-green-700 hover:text-green-800 font-medium"
                    onClick={
                      isNavigating ? (e) => e.preventDefault() : handleClose
                    }
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
