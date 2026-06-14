import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useId } from "react";

const AgentPromptInput = ({
  value,
  onChange,
  maxLength = 500,
  label = "Prompt",
  helperText = "",
  ...props
}) => {
  const charCount = value ? value.length : 0;
  const isError = charCount > maxLength;
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={inputId} className="mb-2 block text-sm font-medium">
          {label}
        </Label>
      )}
      <Textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        aria-invalid={isError}
        aria-describedby={helperId}
        className="resize-none"
        {...props}
      />
      <div id={helperId} className="mt-2 flex items-center justify-between">
        {isError ? (
          <span className="text-destructive text-sm">
            Maximum length is {maxLength} characters.
          </span>
        ) : helperText ? (
          <span className="text-muted-foreground text-sm">{helperText}</span>
        ) : (
          <span className="text-muted-foreground text-sm">&nbsp;</span>
        )}
        <span
          className={cn(
            "text-xs",
            isError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
};

export default AgentPromptInput;
