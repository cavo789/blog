# Run a generated script in any language against your data, without letting it change anything
# Usage: sandbox <image> <data folder> <command...>
# Example: sandbox python:3.13-slim ~/Downloads python summary.py
sandbox() {
    local image="${1:?Usage: sandbox <image> <data folder> <command...>}"
    local data="${2:?Usage: sandbox <image> <data folder> <command...>}"
    shift 2
    (($# > 0)) || { echo "Usage: sandbox <image> <data folder> <command...>" >&2; return 1; }

    [[ -d "$data" ]] || { echo "Data folder not found: $data" >&2; return 1; }
    mkdir -p "$PWD/reports"

    # Same lock as ps1-sandbox: the project and the data are read-only, the image itself too.
    # ./reports is the only place the script can write to.
    docker run --rm -it \
        --network none \
        --read-only --tmpfs /tmp \
        --cap-drop ALL --security-opt no-new-privileges \
        --user "$(id -u):$(id -g)" \
        --volume "$PWD:/app:ro" \
        --volume "$(realpath "$data"):/data:ro" \
        --volume "$PWD/reports:/reports" \
        --workdir /app \
        "$image" "$@"
}
