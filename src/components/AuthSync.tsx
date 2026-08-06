
import { useEffect, useState, useRef } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import { Loader2 } from "lucide-react";
import LogoMark from "@/components/LogoMark";

const AuthSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    const timeout = setTimeout(() => {
      console.warn("[AuthSync] Timeout reached — redirecting to choose-role");
      navigate("/choose-role");
    }, 8000);

    const handleAuthSync = async () => {
      try {
        const supabaseToken = await session?.getToken({ template: "supabase" });
        if (!supabaseToken) {
          console.warn("[AuthSync] No Supabase token — user may not have role yet");
          clearTimeout(timeout);
          navigate("/choose-role");
          return;
        }

        const supabaseClient = createClerkSupabaseClient(supabaseToken);

        const { data, error } = await supabaseClient
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .maybeSingle();

        clearTimeout(timeout);

        if (error) {
          console.error("[AuthSync] Error fetching user:", error);
          navigate("/choose-role");
          return;
        }

        if (!data) {
          navigate("/choose-role");
          return;
        }

        const role = data.user_type;
        if (role === "shipper") navigate("/shipper/dashboard", { replace: true });
        else if (role === "trucker") navigate("/trucker/dashboard", { replace: true });
        else if (role === "admin") navigate("/admin/monitoring", { replace: true });
        else navigate("/choose-role", { replace: true });
      } catch (err) {
        clearTimeout(timeout);
        console.error("[AuthSync] Error:", err);
        navigate("/choose-role", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    handleAuthSync();

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, user, session, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <LogoMark size="h-16 w-16" className="mx-auto mb-6" />
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-200 font-bold">Setting up your account...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Loading your dashboard</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthSync;