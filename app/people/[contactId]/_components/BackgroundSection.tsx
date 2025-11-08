'use client';
import { Item, ItemTitle, ItemContent } from '@/components/ui/item';

export default function BackgroundSection({ cv }: { cv: string }) {
  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">Background</ItemTitle>
      <ItemContent className="mt-3 w-full">
        <p className="text-[14px] text-muted-foreground whitespace-pre-wrap leading-snug">{cv}</p>
      </ItemContent>
    </Item>
  );
}
