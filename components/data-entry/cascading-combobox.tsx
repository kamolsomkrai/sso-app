'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComboboxData } from '@/lib/types';

interface CascadingComboboxProps {
  data: ComboboxData[] | undefined;
  isLoading: boolean;
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export function CascadingCombobox({
  data,
  isLoading,
  value,
  onSelect,
  placeholder,
  disabled = false,
}: CascadingComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel =
    data?.find((item) => item.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || isLoading}
        >
          <span className="truncate">
            {isLoading ? 'กำลังโหลด...' : selectedLabel}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="ค้นหา..." />
          <CommandList>
            <CommandEmpty>
              {data && data.length === 0 ? 'ไม่พบข้อมูล' : '...'}
            </CommandEmpty>
            <CommandGroup>
              {data &&
                data.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label} // Search by label
                    onSelect={() => {
                      onSelect(item.value === value ? '' : item.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}