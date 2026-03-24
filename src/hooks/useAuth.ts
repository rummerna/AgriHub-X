import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthProfile {
  name: string;
  email: string;
  initial: string;
  country: string;
  county: string;
  roles: string[];
  currency: string;
  weatherLocationCountry: string;
  weatherLocationCounty: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (profileData) {
      setProfile({
        name: profileData.full_name || email?.split("@")[0] || "User",
        email: profileData.email || email || "",
        initial: (profileData.full_name?.charAt(0) || email?.charAt(0) || "U").toUpperCase(),
        country: profileData.country || "",
        county: profileData.county || "",
        roles: rolesData?.map((r) => r.role) || [],
        currency: profileData.currency || "KES",
        weatherLocationCountry: profileData.weather_location_country || "",
        weatherLocationCounty: profileData.weather_location_county || "",
      });
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer profile fetch to avoid deadlock with auth trigger
          setTimeout(() => fetchProfile(session.user.id, session.user.email), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: metadata,
      },
    });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (data: { country?: string; county?: string; currency?: string; bio?: string; full_name?: string; phone?: string }) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", user.id);
    if (error) throw error;
    await fetchProfile(user.id, user.email);
  }, [user, fetchProfile]);

  const setRoles = useCallback(async (roles: string[]) => {
    if (!user) return;
    // Delete existing roles then insert new ones
    await supabase.from("user_roles").delete().eq("user_id", user.id);
    if (roles.length > 0) {
      const { error } = await supabase.from("user_roles").insert(
        roles.map((role) => ({ user_id: user.id, role: role as any }))
      );
      if (error) throw error;
    }
    await fetchProfile(user.id, user.email);
  }, [user, fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    // Clean up legacy localStorage
    localStorage.removeItem("agrihubx_user");
  }, []);

  return {
    user: profile,
    supabaseUser: user,
    isLoggedIn: !!user,
    loading,
    login,
    signup,
    updateProfile,
    setRoles,
    logout,
  };
};
