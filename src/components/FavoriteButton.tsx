import { useState, useEffect, useCallback } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { showError } from "@/utils/toast";

interface FavoriteButtonProps {
  entityType: "trip" | "shipment" | "user";
  entityId: string;
  userId: string;
  className?: string;
  size?: number;
}

export default function FavoriteButton({ entityType, entityId, userId, className = "", size = 18 }: FavoriteButtonProps) {
  const { getToken } = useClerkAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavorite = useCallback(async () => {
    try {
      const token = await getToken({ template: "supabase" });
      if (!token) return;
      const supabase = createClerkSupabaseClient(token);
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .maybeSingle();
      setIsFavorited(!!data);
    } catch {
      // ignore
    }
  }, [getToken, userId, entityType, entityId]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const token = await getToken({ template: "supabase" });
      if (!token) throw new Error("Not authenticated");
      const supabase = createClerkSupabaseClient(token);

      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("entity_type", entityType)
          .eq("entity_id", entityId);
        if (error) throw error;
        setIsFavorited(false);
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
        });
        if (error) throw error;
        setIsFavorited(true);
      }
    } catch {
      showError("Failed to update favorite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "p-1.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
        isFavorited && "text-red-500",
        !isFavorited && "text-gray-300 dark:text-gray-600 hover:text-red-400",
        className
      )}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        size={size}
        className={cn("transition-all", isFavorited && "fill-current")}
      />
    </button>
  );
}
