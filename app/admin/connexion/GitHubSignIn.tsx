"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { css } from "@/lib/css";

export function GitHubSignIn() {
  // Après une session expirée, on revient à l'écran qu'on était en train de modifier.
  const back = useSearchParams().get("callbackUrl");
  const callbackUrl = back && back.startsWith("/admin") ? back : "/admin";
  return (
    <button
      type={"button"}
      onClick={() => signIn("github", { callbackUrl })}
      style={css(`margin-top: 10px; min-height: 48px; width: 100%; border: 0; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font: inherit; font-size: 16px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer`)}
    >
      <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"currentColor"}>
        <path d={"M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"} />
      </svg>
      {"Continuer avec GitHub"}
    </button>
  );
}
