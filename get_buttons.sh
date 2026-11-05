#!/bin/bash
find src/components -name "*.jsx" -o -name "*.tsx" | while read -r file; do
  if grep -q "<Tooltip" "$file" && grep -q "<Button.*disabled" "$file"; then
    echo "--- $file ---"
    grep -n -B 3 -A 6 "<Button.*disabled" "$file"
  fi
done
