'use client';

import { useSearchBox } from 'react-instantsearch';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface KeywordSearchBoxProps {
  placeholder?: string;
}

export default function KeywordSearchBox({ placeholder = 'Search by keyword...' }: KeywordSearchBoxProps) {
  const { refine, query } = useSearchBox();
  const [input, setInput] = useState(query ?? '');

  useEffect(() => {
    setInput(query ?? '');
  }, [query]);

  const handleChange = (value: string) => {
    setInput(value);
    refine(value.trim() || '');
  };

  return (
    <div className="relative">
      <Input
        className="ps-12 pe-4 py-6 text-lg"
        placeholder={placeholder}
        type="search"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-muted-foreground/80 peer-disabled:opacity-50">
        <SearchIcon size={20} />
      </div>
    </div>
  );
}
