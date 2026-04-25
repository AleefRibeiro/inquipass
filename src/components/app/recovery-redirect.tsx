"use client";

import { useEffect } from "react";

export function RecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecovery =
      hash.includes("type=recovery") ||
      search.includes("type=recovery") ||
      (hash.includes("access_token=") && hash.includes("refresh_token="));

    if (isRecovery && !window.location.pathname.startsWith("/resetar-senha")) {
      window.location.replace(`/resetar-senha${hash || search}`);
    }
  }, []);

  return null;
}
