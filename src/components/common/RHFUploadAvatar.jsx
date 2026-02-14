import { Controller, useFormContext } from "react-hook-form";
import UploadAvatar from "./UploadAvatar";

export function RHFUploadAvatar({ name, onDrop, helperText, loading }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const errorId = `${name}-error`;

        return (
          <div>
            <UploadAvatar
              error={!!error}
              file={field.value}
              onDrop={onDrop}
              helperText={helperText}
              loading={loading}
              aria-describedby={error ? errorId : undefined}
            />

            {!!error && (
              <p
                id={errorId}
                className="text-destructive px-4 text-center text-sm"
                role="alert"
              >
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
