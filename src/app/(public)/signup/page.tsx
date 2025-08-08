import { Utensils } from "lucide-react";
import { SignupForm } from "./_components/signup-form";

// Server Component - fetches initial data
async function getSignupData() {
  try {
    // You can fetch user stats or other initial data here
    return {
      isBackendAvailable: true,
      userCount: 1250, // This could come from your API
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
        {/* Left Side - Welcome Section */}
        <div className="w-1/2 bg-gradient-to-br from-green-600 to-green-700 flex flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white/20 rounded-full"></div>
          </div>

          {/* Breadcrumb */}
          <div className="absolute top-8 left-8">
            <p className="text-white/70 text-sm">
              Home <span className="mx-2">›</span> Register
            </p>
          </div>

          {/* Welcome Content */}
          <div className="text-center text-white z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl font-light">Join</span>
              <div className="flex items-center gap-2">
                <Utensils className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold">Food Bundle</h1>
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

        {/* Right Side - Signup Form */}
        <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <SignupForm signupData={signupData} />
          </div>
        </div>
      </div>
    </div>
  );
}
