/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { SignupModal } from "./signupModel";

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
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    isBackendAvailable: true,
    message: "",
  });
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
    if (isOpen && !showSignup) {
      setIsAnimating(true);
      setIsNavigating(false);
    }
  }, [isOpen, showSignup]);

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
    if (isNavigating || showSignup) return;

    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setError("");
      setShowPassword(false);
      setShowSignup(false);
    }, 300);
  };

  const handleShowSignup = async () => {
    // Check backend availability before showing signup
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setSignupData({ isBackendAvailable: true, message: "" });
      } else {
        setSignupData({
          isBackendAvailable: false,
          message: "Service temporarily unavailable. Please try again later.",
        });
      }
    } catch (error) {
      setSignupData({
        isBackendAvailable: false,
        message: "Service temporarily unavailable. Please try again later.",
      });
    }

    setShowSignup(true);
  };

  const handleBackToLogin = () => {
    setShowSignup(false);
    setIsAnimating(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
    onClose();
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

  const getButtonText = () => {
    if (isNavigating) return "Please wait...";
    if (isLoading) return "logging in...";
    if (pendingProduct) return "LOG IN";
    if (pendingRedirect) return "LOG IN";
    return "LOG IN";
  };

  // Render signup modal if it's open
  if (showSignup) {
    return (
      <SignupModal
        isOpen={showSignup}
        onClose={handleSignupClose}
        onBackToLogin={handleBackToLogin}
        signupData={signupData}
      />
    );
  }

  if (!isOpen) return null;

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
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-4 overflow-hidden transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 -translate-x-full"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Green Section (hidden on small screens) */}
          <div className="hidden md:flex w-1/2 bg-green-700 text-white p-8 flex-col justify-center relative">
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
          <div className="w-full md:w-1/2 p-6 sm:p-8 relative">
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
                    placeholder="Enter Email or Phone"
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
                  <button
                    onClick={isNavigating ? undefined : handleShowSignup}
                    className="text-green-700 hover:text-green-800 font-medium"
                    disabled={isNavigating}
                  >
                    Create account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
