'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from '@/components/ui/icons/lucide-sparkles';

interface NaturalLanguageFilterInputProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function NaturalLanguageFilterInput({
  onSubmit,
  placeholder = 'Describe filters in natural language...',
  isLoading = false,
}: NaturalLanguageFilterInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <Input
          className="pe-10"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
        />
        <Button
          className="absolute inset-y-0 end-0 h-full px-3 rounded-l-none"
          aria-label="Create filters with AI"
          type="submit"
          disabled={isLoading || !value.trim()}
          size="sm"
        >
          <SparklesIcon size={16} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
