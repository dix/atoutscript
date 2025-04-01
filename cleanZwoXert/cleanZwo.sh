#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

if [ ! -d "$1" ]; then
    echo "Error: Directory '$1' does not exist."
    exit 1
fi

find "$1" -type f -name "*.zwo" | while read -r file; do
    echo "Processing: $file"

    temp_file=$(mktemp)

    sed -E '/[[:space:]]*<ftpOverride>[^<]*<\/ftpOverride>[[:space:]]*/d' "$file" > "$temp_file"

    if cmp -s "$file" "$temp_file"; then
        echo "  No ftpOverride tag found in $file"
        rm "$temp_file"
    else
        mv "$temp_file" "$file"
        echo "  Removed ftpOverride line from $file"
    fi
done

echo "Processing complete."