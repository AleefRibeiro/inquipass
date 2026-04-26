"use client";

import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { useInquiPassStore } from "@/lib/mock-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchTenantWorkspace } from "@/lib/supabase/tenant-sync";
import type { AccountType } from "@/lib/types";

function inferAccountType(user: User): AccountType {
  return (
    (user.user_metadata?.account_type as AccountType | undefined) ??
    (user.user_metadata?.type as AccountType | undefined) ??
    "tenant"
  );
}

function inferFullName(user: User) {
  if (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) {
    return user.user_metadata.full_name;
  }

  if (typeof user.user_metadata?.name === "string" && user.user_metadata.name) {
    return user.user_metadata.name;
  }

  return user.email?.split("@")[0] ?? "Usuario";
}

export function AuthSessionSync() {
  const { adoptAuthenticatedAccount, syncTenantWorkspace, logout } = useInquiPassStore();
  const adoptRef = useRef(adoptAuthenticatedAccount);
  const syncTenantRef = useRef(syncTenantWorkspace);
  const logoutRef = useRef(logout);

  useEffect(() => {
    adoptRef.current = adoptAuthenticatedAccount;
    syncTenantRef.current = syncTenantWorkspace;
    logoutRef.current = logout;
  }, [adoptAuthenticatedAccount, logout, syncTenantWorkspace]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    const client = supabase;

    let cancelled = false;

    async function syncUser(user: User) {
      const { data: rawProfile } = await client
        .from("users_profile")
        .select("auth_user_id, account_type, full_name, email, phone")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      let profile = rawProfile;

      if (!profile) {
        const inferredType = inferAccountType(user);
        const { data: createdProfile } = await client
          .from("users_profile")
          .insert({
            auth_user_id: user.id,
            account_type: inferredType,
            full_name: inferFullName(user),
            email: user.email ?? "",
            phone: "",
            lgpd_consent: true,
          })
          .select("auth_user_id, account_type, full_name, email, phone")
          .single();

        profile = createdProfile ?? null;
      }

      if (!profile || cancelled) {
        return;
      }

      adoptRef.current({
        auth_user_id: profile.auth_user_id,
        account_type: profile.account_type as AccountType,
        full_name: profile.full_name,
        email: profile.email ?? user.email ?? "",
        phone: profile.phone ?? "",
        company_name: profile.account_type === "agency" ? "Imobiliária Demo" : undefined,
      });

      if (profile.account_type === "tenant") {
        const workspace = await fetchTenantWorkspace(client, profile.auth_user_id);
        if (!cancelled && workspace) {
          syncTenantRef.current(workspace);
        }
      }
    }

    void client.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        return syncUser(data.session.user);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void syncUser(session.user);
        return;
      }

      logoutRef.current();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
