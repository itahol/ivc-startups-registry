'use client';

import { Button } from '@/components/ui/button';
import { Authenticated, Unauthenticated } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { UserMenu } from '@/components/UserMenu';
import Link from 'next/link';

/**
 * Isolated client-only auth area so the surrounding Navbar can be a Server Component.
 * This keeps shipped JS minimal while preserving authenticated user interactions.
 */
export function UserAuthArea() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex items-center gap-2">
      <Authenticated>
        <UserMenu
          userName={user?.firstName ?? undefined}
          userEmail={user?.email}
          userAvatar={user?.profilePictureUrl ?? undefined}
          onItemClick={(item) => {
            if (item === 'logout') {
              signOut();
            }
          }}
        />
      </Authenticated>
      <Unauthenticated>
        <Button asChild variant="ghost" size="sm" className="text-sm">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="sm" className="text-sm">
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </Unauthenticated>
    </div>
  );
}

export default UserAuthArea;
