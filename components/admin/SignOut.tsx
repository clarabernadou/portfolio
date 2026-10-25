"use client";

import { signOut } from "next-auth/react";
import { Icon } from "./icons";

export function SignOut() {
  return (
    <button type="button" className="adm-logout" onClick={() => signOut({ callbackUrl: "/" })}>
      <Icon name="logout" />
      Se déconnecter
    </button>
  );
}
