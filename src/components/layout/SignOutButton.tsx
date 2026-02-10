"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Cerrar Sesión
    </Button>
  );
}
