import { useId } from 'react';
import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SparklesIcon } from '@/components/ui/icons/lucide-sparkles';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  nlEnabled?: boolean;
  onNLToggle?: (checked: boolean) => void;
  label?: string;
  placeholder?: string;
  hideSubmitButton?: boolean;
  hideLabel?: boolean;
  autoFocus?: boolean;
  size?: 'default' | 'large';
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  nlEnabled = false,
  onNLToggle,
  label = 'Search',
  placeholder = 'Search...',
  hideSubmitButton = false,
  hideLabel = false,
  autoFocus = false,
  size = 'default',
}: SearchInputProps) {
  const id = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value ?? '');
  };

  const handleInputChange = (newValue: string) => {
    onChange?.(newValue);
  };

  const inputPlaceholder = nlEnabled ? 'Ask in natural language...' : placeholder;

  return (
    <form onSubmit={handleSubmit} className={hideLabel ? '' : '*:not-first:mt-2'}>
      <Label htmlFor={id} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Label>
      <div className="flex items-center gap-2 mb-2">
        <Switch id={`${id}-nl-toggle`} checked={nlEnabled} onCheckedChange={onNLToggle} />
        <Label htmlFor={`${id}-nl-toggle`} className="text-sm cursor-pointer">
          Natural Language Search
        </Label>
      </div>
      <div className="relative">
        <Input
          id={id}
          className={`peer ${size === 'large' ? 'ps-12 pe-12 py-6 text-lg' : 'ps-9 pe-9'}`}
          placeholder={inputPlaceholder}
          type="search"
          value={value ?? ''}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus={autoFocus}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ${size === 'large' ? 'ps-4' : 'ps-3'} text-muted-foreground/80 peer-disabled:opacity-50`}
        >
          <SearchIcon size={size === 'large' ? 20 : 16} />
        </div>
        {!hideSubmitButton && (
          <button
            className={`absolute inset-y-0 end-0 flex items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${size === 'large' ? 'h-full w-12' : 'h-full w-9'}`}
            aria-label={nlEnabled ? 'Natural language search' : 'Submit search'}
            type="submit"
          >
            <SparklesIcon size={size === 'large' ? 20 : 16} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
