import React from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { ReactNode } from "react";

export function Authenticated({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return null;
  }
  return <>{children}</>;
}

/**
 * Renders children if the client is using authentication but is not authenticated.
 *
 * @public
 */
export function Unauthenticated({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || user) {
    return null;
  }
  return <>{children}</>;
}

/**
 * Renders children if the client isn't using authentication or is in the process
 * of authenticating.
 *
 * @public
 */
export function AuthLoading({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  if (!loading) {
    return null;
  }
  return <>{children}</>;
}
