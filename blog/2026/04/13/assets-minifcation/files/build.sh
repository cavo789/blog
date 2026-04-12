#!/bin/bash

# Ensure yq is installed
if ! command -v yq &> /dev/null; then
    echo "Error: 'yq' is not installed."
    exit 1
fi

CONFIG_FILE="manifest.yaml"
DOCKER_IMAGE="tdewolff/minify:latest"

echo "--- Starting Build Process ---"

# Create dist directory
mkdir -p dist/assets

# Iterate through bundles - Added -r flag to all yq calls
bundle_count=$(yq -r '.bundles | length' "$CONFIG_FILE")

for ((i=0; i<$bundle_count; i++)); do
    # Using -r to get raw strings without quotes
    NAME=$(yq -r ".bundles[$i].name" "$CONFIG_FILE")
    TYPE=$(yq -r ".bundles[$i].type" "$CONFIG_FILE")
    OUTPUT=$(yq -r ".bundles[$i].output" "$CONFIG_FILE")

    echo "Processing Bundle: $NAME [$TYPE]"

    TEMP_FILE="temp_bundle.$TYPE"
    rm -f "$TEMP_FILE"

    input_count=$(yq -r ".bundles[$i].inputs | length" "$CONFIG_FILE")
    for ((j=0; j<$input_count; j++)); do
        INPUT_PATH=$(yq -r ".bundles[$i].inputs[$j]" "$CONFIG_FILE")

        # Now INPUT_PATH is "public/assets/css/reset.css" (no literal quotes)
        if [ -f "$INPUT_PATH" ]; then
            cat "$INPUT_PATH" >> "$TEMP_FILE"
            echo "  + Added $INPUT_PATH"
        else
            echo "  ! Warning: File $INPUT_PATH not found. Skipping."
        fi
    done

    if [ -f "$TEMP_FILE" ]; then
        echo "  > Minifying..."
        # We ensure the output directory exists for this specific file
        mkdir -p "$(dirname "$OUTPUT")"

        docker run --rm -v "$(pwd):/src" "$DOCKER_IMAGE" \
            --type="$TYPE" \
            "/src/$TEMP_FILE" > "$OUTPUT"

        rm "$TEMP_FILE"
        echo "  ✓ Generated: $OUTPUT"
    else
        echo "  × Error: No input files found for bundle $NAME."
    fi
done

echo "--- Build Complete ---"