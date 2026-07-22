"use client";

import { useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import { Loader2 } from "lucide-react";

const AuthSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const handleAuthSync = async () => {
      try {
        const supabaseToken = await session?.getToken({ template: "supabase" });
        if (!supabaseToken) {
          console.warn("[AuthSync] No Supabase token — user may not have role yet");
          navigate("/choose-role");
          return;
        }

        const supabaseClient = createClerkSupabaseClient(supabaseToken);

        const { data, error } = await supabaseClient
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .maybeSingle();

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
        console.error("[AuthSync] Error:", err);
        navigate("/choose-role", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    handleAuthSync();
  }, [isLoaded, isSignedIn, user, session?.id, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthSync;