import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "./input";
import { TouchTarget } from "./touch-target";

export interface InputWithClearProps extends InputProps {
  onClear?: () => void;
}

const InputWithClear = React.forwardRef<HTMLInputElement, InputWithClearProps>(
  ({ className, value, onClear, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    
    // Sync with external value changes
    React.useEffect(() => {
      setInternalValue(value || "");
    }, [value]);

    const handleClear = () => {
      setInternalValue("");
      if (onClear) {
        onClear();
      }
      // Create synthetic event for onChange
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const showClear = internalValue && internalValue.toString().length > 0;

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          className={cn("pr-10", className)}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showClear && (
          <TouchTarget
            className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={handleClear}
            size="default"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </div>
          </TouchTarget>
        )}
      </div>
    );
  }
);

InputWithClear.displayName = "InputWithClear";

export { InputWithClear };
