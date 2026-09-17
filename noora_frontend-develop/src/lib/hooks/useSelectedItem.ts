import { useCallback, useState } from "react";

type useSelectedItemReturn<T> = {
  selectedItem: T | null;
  setSelectedItem: (item: T | null) => void;
  handleItemSelect: (item: T) => void;
  handleItemDeselect: () => void;
};

function useSelectedItem<T = any>(initialValue?: T): useSelectedItemReturn<T> {
  const [selectedItem, setSelectedItem] = useState<T | null>(
    initialValue ?? null,
  );

  const handleItemSelect = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const handleItemDeselect = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    setSelectedItem,
    handleItemSelect,
    handleItemDeselect,
  };
}

export { useSelectedItem };
