"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface LevelFilterProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const LEVEL_OPTIONS = [
  { value: 1, label: 'L1 - Top Category', description: 'Highest level view' },
  { value: 2, label: 'L2 - Main Groups', description: 'Major category groups' },
  { value: 3, label: 'L3 - Sub-Categories', description: 'Detailed categories' },
  { value: 4, label: 'L4 - Line Items', description: 'Specific line items' },
  { value: 5, label: 'L5 - Details', description: 'Most granular level' },
];

export function LevelFilter({ value, onChange, className }: LevelFilterProps) {
  return (
    <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v))}>
      <SelectTrigger className={className}>
        <Filter className="w-4 h-4 mr-2 text-slate-400" />
        <SelectValue placeholder="Select Level" />
      </SelectTrigger>
      <SelectContent>
        {LEVEL_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-slate-500">{option.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
