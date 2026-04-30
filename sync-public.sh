#!/bin/bash

# sync-public.sh
# Scans vault recursively for files with 'public' in the frontmatter.

VAULT_DIR="$HOME/Documents/Vault/Mordor"
PROJECT_VAULT="src/content/vault"

if [ ! -d "$VAULT_DIR" ]; then
  echo "Error: Vault directory $VAULT_DIR not found."
  exit 1
fi

mkdir -p "$PROJECT_VAULT"

echo "Checking for public tags in $VAULT_DIR..."

# We use a temporary file to track count because of subshell piping
tmp_count=$(mktemp)
echo 0 > "$tmp_count"

find "$VAULT_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) | while read -r file; do
  # Extract frontmatter and check for public (handles - public, #public, tags: [public])
  if sed -n '/^---$/,/^---$/p' "$file" | grep -q "public"; then
    filename=$(basename "$file")
    dest_name="${filename%.md}.mdx"
    
    cp "$file" "$PROJECT_VAULT/$dest_name"
    echo "  [+] $filename -> $dest_name"
    
    curr=$(cat "$tmp_count")
    echo $((curr + 1)) > "$tmp_count"
  fi
done

final_count=$(cat "$tmp_count")
rm "$tmp_count"

echo "Finished. Synced $final_count files."
