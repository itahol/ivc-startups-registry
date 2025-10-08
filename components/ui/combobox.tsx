import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from '@/components/ui/command';
import { cn } from '../../lib/utils';
import { PopoverTrigger, PopoverContent, Popover } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface MultiSelectComboboxProps<T> {
  label: string;
  items: T[] | undefined;
  loading: boolean;
  isSelected: (item: T) => boolean;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onToggle: (item: T) => void;
  placeholder?: string;
  search?: boolean; // enable text search
  selectedBadgeLimit?: number;
  onClear?: () => void;
  emptyMessage?: string;
}

function MultiSelectCombobox<T>(props: MultiSelectComboboxProps<T>) {
  const {
    label,
    items,
    loading,
    isSelected,
    getKey,
    getLabel,
    onToggle,
    placeholder = 'Search...',
    search = false,
    selectedBadgeLimit = 4,
    onClear,
    emptyMessage = 'No results.',
  } = props;
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    if (!open && searchValue) setSearchValue('');
  }, [open, searchValue]);

  const filtered = React.useMemo(() => {
    if (!items) return [] as T[];
    if (!search || !searchValue.trim()) return items;
    const q = searchValue.toLowerCase();
    return items.filter((i) => getLabel(i).toLowerCase().includes(q));
  }, [items, search, searchValue, getLabel]);

  const selectedItems = React.useMemo(() => (items ? items.filter(isSelected) : []), [items, isSelected]);
  const hiddenCount = Math.max(0, selectedItems.length - selectedBadgeLimit);

  return (
    <div className="space-y-2" aria-label={label}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-[140px] justify-between"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="truncate text-left">
                {selectedItems.length ? `${label} (${selectedItems.length})` : `Select ${label.toLowerCase()}`}
              </span>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Command shouldFilter={false} className="max-h-72">
                {search ? (
                  <CommandInput
                    value={searchValue}
                    onValueChange={setSearchValue}
                    placeholder={placeholder}
                    aria-label={`Search ${label}`}
                  />
                ) : null}
                <CommandList aria-multiselectable="true" className="overflow-y-auto">
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup heading={label}>
                    {filtered.map((item) => {
                      const active = isSelected(item);
                      return (
                        <CommandItem
                          key={getKey(item)}
                          onSelect={() => onToggle(item)}
                          aria-pressed={active}
                          className="cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex size-4 items-center justify-center rounded-sm border',
                                active ? 'bg-primary text-primary-foreground' : 'bg-background',
                              )}
                            >
                              {active ? <Check className="size-3" /> : null}
                            </span>
                            {getLabel(item)}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
        {selectedItems.length > 0 && onClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onClear}
            aria-label={`Clear selected ${label}`}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {selectedItems.length ? (
        <div className="flex flex-wrap gap-1" aria-live="polite" aria-label={`Selected ${label}`}>
          {selectedItems.slice(0, selectedBadgeLimit).map((item) => (
            <Button
              key={getKey(item)}
              type="button"
              size="sm"
              variant="secondary"
              className="h-6 rounded-full px-2 text-xs"
              onClick={() => onToggle(item)}
              aria-label={`Remove ${getLabel(item)}`}
            >
              <span className="flex items-center gap-1">
                {getLabel(item)} <X className="size-3 opacity-60" />
              </span>
            </Button>
          ))}
          {hiddenCount > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-full px-2 text-xs"
              onClick={() => setOpen(true)}
              aria-label={`Show ${hiddenCount} more selected ${label}`}
            >
              +{hiddenCount} more
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface SingleSelectComboboxProps<T> {
  label: string;
  items: T[] | undefined;
  loading: boolean;
  selected: T | undefined;
  onSelect: (item: T | undefined) => void; // passing undefined clears selection
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  placeholder?: string;
}

function SingleSelectCombobox<T>({
  label,
  items,
  loading,
  selected,
  onSelect,
  getKey,
  getLabel,
  placeholder = 'Search...',
}: SingleSelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    if (!open && searchValue) setSearchValue('');
  }, [open, searchValue]);

  const filtered = React.useMemo(() => {
    if (!items) return [] as T[];
    if (!searchValue.trim()) return items;
    const q = searchValue.toLowerCase();
    return items.filter((i) => getLabel(i).toLowerCase().includes(q));
  }, [items, searchValue, getLabel]);

  return (
    <div className="space-y-2" aria-label={label}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-[140px] justify-between"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="truncate text-left">
                {selected ? getLabel(selected) : `Select ${label.toLowerCase()}`}
              </span>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Command shouldFilter={false} className="max-h-72">
                <CommandInput
                  value={searchValue}
                  onValueChange={setSearchValue}
                  placeholder={placeholder}
                  aria-label={`Search ${label}`}
                />
                <CommandList className="overflow-y-auto">
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup heading={label}>
                    {filtered.map((item) => {
                      const active = selected && getKey(selected) === getKey(item);
                      return (
                        <CommandItem
                          key={getKey(item)}
                          onSelect={() => {
                            onSelect(item);
                            setOpen(false);
                          }}
                          aria-selected={active}
                          className="cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex size-4 items-center justify-center rounded-sm border',
                                active ? 'bg-primary text-primary-foreground' : 'bg-background',
                              )}
                            >
                              {active ? <Check className="size-3" /> : null}
                            </span>
                            {getLabel(item)}
                          </span>
                        </CommandItem>
                      );
                    })}
                    {selected ? (
                      <CommandItem
                        key="__clear__"
                        onSelect={() => {
                          onSelect(undefined);
                          setOpen(false);
                        }}
                        className="text-destructive/80 hover:text-destructive"
                      >
                        Clear selection
                      </CommandItem>
                    ) : null}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
        {selected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onSelect(undefined)}
            aria-label={`Clear selected ${label}`}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { MultiSelectCombobox, SingleSelectCombobox };
