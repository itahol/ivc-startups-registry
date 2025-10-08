import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from '@/components/ui/command';
import { cn } from '../../lib/utils';
import { PopoverTrigger, PopoverContent, Popover } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

export interface MultiSelectComboboxProps<T, V extends string> {
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => V; // must be stable and unique per option
  value?: V[]; // selected option values
  defaultValue?: V[];
  onChange?: (values: V[]) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  showChips?: boolean; // show removable chips under the button
}

function MultiSelectCombobox<T, V extends string = string>({
  options,
  getOptionLabel,
  getOptionValue,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  className,
  buttonClassName,
  disabled,
  showChips = true,
}: MultiSelectComboboxProps<T, V>) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useControllableArray({ value, defaultValue, onChange });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = React.useState<number>();

  React.useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef.current?.offsetWidth]);

  const toggle = React.useCallback(
    (v: V) => {
      setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
    },
    [setSelected],
  );

  const valueToLabel = React.useMemo(() => {
    const map = new Map<V, string>();
    for (const o of options) {
      map.set(getOptionValue(o), getOptionLabel(o));
    }
    return map;
  }, [options, getOptionLabel, getOptionValue]);

  const selectedLabels = React.useMemo(() => selected.map((v) => valueToLabel.get(v) ?? v), [selected, valueToLabel]);

  const buttonText = React.useMemo(() => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selectedLabels[0];
    return `${selectedLabels[0]} (+${selected.length - 1})`;
  }, [selected.length, selectedLabels, placeholder]);

  return (
    <div className={cn('w-fit', className)}>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-[200px] justify-between',
              selected.length === 0 && 'text-muted-foreground',
              buttonClassName,
            )}
          >
            <span className="truncate text-left">{buttonText}</span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: buttonWidth }}>
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const val = getOptionValue(opt);
                  const label = getOptionLabel(opt);
                  const isActive = selected.includes(val);
                  return (
                    <CommandItem key={val} value={label} onSelect={() => toggle(val)}>
                      {label}
                      <Check className={cn('ml-auto', isActive ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showChips && selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 max-w-[360px]">
          {selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              {valueToLabel.get(v) ?? v}
              <button
                type="button"
                className="opacity-70 hover:opacity-100"
                onClick={() => toggle(v)}
                aria-label={`Remove ${valueToLabel.get(v) ?? v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function useControllableArray<T, V extends string>({
  value,
  defaultValue = [],
  onChange,
}: Pick<MultiSelectComboboxProps<T, V>, 'value' | 'defaultValue' | 'onChange'>) {
  const [internal, setInternal] = React.useState<V[]>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const set = React.useCallback(
    (next: V[] | ((prev: V[]) => V[])) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      if (!isControlled) setInternal(resolved);
      onChange?.(resolved);
    },
    [current, isControlled, onChange],
  );

  return [current, set] as const;
}

export { MultiSelectCombobox };
