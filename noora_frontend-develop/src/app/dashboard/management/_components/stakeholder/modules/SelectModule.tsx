import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SelectModuleProps {
  value: { value: string; label: string }[] | [];
  setValue: (data: { value: string; label: string }[]) => void;
  data: { value: string; label: string }[];
}

export default function SelectModule({
  value,
  setValue,
  data,
}: SelectModuleProps) {
  const [open, setOpen] = useState<boolean>(false);

  const isSelected = (itemValue: string) =>
    value.some((selectedItem) => selectedItem.value === itemValue);

  const toggleSelect = (selectedItem: { value: string; label: string }) => {
    const newValue = isSelected(selectedItem.value)
      ? value.filter((item) => item.value !== selectedItem.value)
      : [...value, selectedItem];
    setValue(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="flex flex-col w-[30%]">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between flex-row h-fit whitespace-pre-line">
          {value.length ? value.map((item) => item.label).join(", ") : "انتخاب"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 PopoverContent">
        <Command>
          <CommandInput placeholder="جستجو" dir="rtl" />
          <CommandEmpty>یافت نشد...</CommandEmpty>
          <CommandGroup>
            {data.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => toggleSelect(item)}>
                <Check
                  className={cn("mr-2 h-4 w-4", {
                    "opacity-100": isSelected(item.value),
                    "opacity-0": !isSelected(item.value),
                  })}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
