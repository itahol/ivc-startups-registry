import { useId } from "react";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  label?: string;
  placeholder?: string;
  hideSubmitButton?: boolean;
  hideLabel?: boolean;
  autoFocus?: boolean;
  size?: "default" | "large";
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  label = "Search",
  placeholder = "Search...",
  hideSubmitButton = false,
  hideLabel = false,
  autoFocus = false,
  size = "default",
}: SearchInputProps) {
  const id = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={hideLabel ? "" : "*:not-first:mt-2"}
    >
      <Label htmlFor={id} className={hideLabel ? "sr-only" : ""}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          className={`peer ${size === "large" ? "ps-12 pe-12 py-6 text-lg" : "ps-9 pe-9"}`}
          placeholder={placeholder}
          type="search"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          autoFocus={autoFocus}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ${size === "large" ? "ps-4" : "ps-3"} text-muted-foreground/80 peer-disabled:opacity-50`}
        >
          <SearchIcon size={size === "large" ? 20 : 16} />
        </div>
        {!hideSubmitButton && (
          <button
            className={`absolute inset-y-0 end-0 flex items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${size === "large" ? "h-full w-12" : "h-full w-9"}`}
            aria-label="Submit search"
            type="submit"
          >
            <ArrowRightIcon
              size={size === "large" ? 20 : 16}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </form>
  );
}
