import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type UserProfile = {
  display_name: string | null;
  avatar_url: string | null;
  provider: string | null;
};

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, provider")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export function resolveDisplayName(profile: UserProfile | null, user: User | null): string {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) return fromProfile;

  const meta = user?.user_metadata;
  const fromMeta =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    (typeof meta?.user_name === "string" && meta.user_name.trim());
  if (fromMeta) return fromMeta;

  const email = user?.email;
  if (email) return email.split("@")[0];

  return "고객";
}

export function resolveAvatarUrl(
  profile: UserProfile | null,
  user: User | null,
): string | null {
  const fromProfile = profile?.avatar_url?.trim();
  if (fromProfile) return fromProfile;

  const meta = user?.user_metadata;
  const fromMeta =
    (typeof meta?.avatar_url === "string" && meta.avatar_url.trim()) ||
    (typeof meta?.picture === "string" && meta.picture.trim());
  return fromMeta || null;
}
