import { useMemo, useState } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
};

export default function Tabs({ items, value, defaultValue, onChange }: TabsProps) {
  const initial = useMemo(() => {
    if (value) return value;
    if (defaultValue) return defaultValue;
    return items[0]?.id ?? "";
  }, [value, defaultValue, items]);

  const [internalValue, setInternalValue] = useState(initial);
  const active = value ?? internalValue;
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  function handleClick(id: string) {
    if (!value) setInternalValue(id);
    onChange?.(id);
  }

  if (!activeItem) return null;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="tabs">
        {items.map((item) => (
          <button
            key={item.id}
            className={`tabButton ${item.id === active ? "tabButtonActive" : ""}`.trim()}
            onClick={() => handleClick(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>{activeItem.content}</div>
    </div>
  );
}
