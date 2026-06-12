import { SignUp } from "@clerk/clerk-react";
import { Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg shadow-md">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">LoadSaathi</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join the LoadSaathi marketplace</p>
          </div>
          <SignUp
            routing="path"
            path="/register"
            signInFallbackRedirectUrl="/login"
            afterSignUpUrl="/choose-role"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
