// Server Component Navbar (no client hooks)
import Logo from '@/components/navbar-components/logo';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// (refactored)
// removed Authenticated/Unauthenticated from server component
// import { UserMenu } from './UserMenu'; // moved into isolated client component
// Active route highlighting skipped in server version to avoid client hook usage.

// Server Component version of Navbar. Only the auth area is a client component now.

import UserAuthArea from '@/components/navbar-components/UserAuthArea';
import Link from 'next/link';
import ClientNavigationMenuLink from './navbar-components/client-navigation-menu-link';
import { cn } from '../lib/utils';

// Central nav link definitions kept close to where they're rendered (clear & flexible)
const NAV_LINKS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/', label: 'Home', exact: true },
  { href: '/companies', label: 'Companies', exact: true },
];

export default function Navbar() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center md:hidden">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-8" variant="ghost" size="icon">
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {NAV_LINKS.map((link, index) => (
                      <NavigationMenuItem key={index} className="h-full">
                        <ClientNavigationMenuLink
                          href={link.href}
                          label={link.label}
                          className="text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-[active]:bg-transparent!"
                        />
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-primary hover:text-primary/90" aria-label="Home">
              <Logo />
            </Link>
            {/* Navigation menu */}
            <NavigationMenu className="flex">
              <NavigationMenuList className="gap-1">
                {NAV_LINKS.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <ClientNavigationMenuLink
                      href={link.href}
                      label={link.label}
                      className={cn(
                        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer relative',
                        'before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100',
                      )}
                    />
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Auth area (client) */}
          <UserAuthArea />
        </div>
      </div>
    </header>
  );
}
