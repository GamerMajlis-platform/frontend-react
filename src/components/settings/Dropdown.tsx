import { ChevronDown } from "../../lib/icons";

// Settings-only dropdown
export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  type: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (type: string) => void;
}

export default function Dropdown({
  type,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: DropdownProps) {
  const selected = options.find((opt) => opt.value === value)?.label || value;
  return (
    <div className="relative">
      <button
        className="flex items-center justify-between py-2 px-3 rounded-md cursor-pointer min-w-[120px] text-sm bg-dark-secondary border border-slate-500 text-text transition duration-150"
        onClick={() => onToggle(type)}
      >
        {selected}
        <ChevronDown
          size={16}
          className={`transition-transform duration-150 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute top-full ${
            typeof document !== "undefined" &&
            document.documentElement.dir === "rtl"
              ? "left-0"
              : "right-0"
          } mt-1 rounded-md shadow-lg z-10 min-w-[120px] bg-dark-secondary border border-slate-500`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className="block w-full py-2 px-3 bg-transparent border-none text-left cursor-pointer text-sm text-text hover:bg-dark-secondary/80 transition duration-150"
              onClick={() => {
                onSelect(option.value);
                onToggle(type);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
