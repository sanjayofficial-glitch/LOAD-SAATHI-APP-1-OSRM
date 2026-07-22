import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import LogoMark from "@/components/LogoMark";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full mb-8">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size="h-9 w-9" />
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">LoadSaathi</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="text-center mb-8">
            <LogoMark size="h-14 w-14" className="mx-auto mb-4" />
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
