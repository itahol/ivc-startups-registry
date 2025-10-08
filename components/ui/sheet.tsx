'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right';
  widthClass?: string;
  showCloseButton?: boolean;
}

const sideClasses: Record<string, string> = {
  left: 'left-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  right: 'right-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
};

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, children, side = 'left', widthClass = 'w-80', showCloseButton = true, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed top-0 z-50 h-dvh bg-background p-5 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          sideClasses[side],
          widthClass,
          className,
        )}
        {...props}
      >
        {showCloseButton && (
          <SheetClose
            className="absolute right-3 top-3 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close panel"
          >
            <XIcon className="size-4" />
          </SheetClose>
        )}
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = 'SheetContent';

function SheetHeader(props: React.ComponentProps<'div'>) {
  return <div className="mb-4 flex items-center justify-between" {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader };
