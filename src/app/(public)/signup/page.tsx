import { Utensils } from "lucide-react";
import { SignupForm } from "./_components/signup-form";
import Link from "next/link";

async function getSignupData() {
  try {
    return {
      isBackendAvailable: true,
      userCount: 1250, 
    };
  } catch (error) {
    return {
      isBackendAvailable: false,
        message: "Unable to connect to server",
      error,
      userCount: 0,
    };
  }
}

export default async function SignupPage() {
  const signupData = await getSignupData();

  return (
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
              <span className="mx-2">›</span> Signup
            </p>
          </div>

          <div className="text-center text-white z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl font-light">Join</span>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Food Bundles</h1>
              </div>
            </div>
            <p className="text-white/90 text-lg max-w-md leading-relaxed mb-4">
              Start your journey with sustainable food trading and connect with
              local producers.
            </p>
            {signupData.userCount > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/90 text-sm">
                  Join{" "}
                  <span className="font-bold text-white">
                    {signupData.userCount}+
                  </span>{" "}
                  users already growing their business with us
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <SignupForm signupData={signupData} />
          </div>
        </div>
      </div>
    </div>
  );
}
