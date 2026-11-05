# Run a generated PowerShell script against your data, without letting it change anything
# Usage: ps1-sandbox <script.ps1> <data folder> [reports folder, default ./reports]
ps1-sandbox() {
    local script="${1:?Usage: ps1-sandbox <script.ps1> <data folder> [reports folder]}"
    local data="${2:?Usage: ps1-sandbox <script.ps1> <data folder> [reports folder]}"
    local reports="${3:-$PWD/reports}"

    [[ -f "$script" ]] || { echo "Script not found: $script" >&2; return 1; }
    [[ -d "$data" ]] || { echo "Data folder not found: $data" >&2; return 1; }
    mkdir -p "$reports"

    # The project and the data are read-only, the image itself too.
    # The reports folder is the only place the script can write to.
    docker run --rm -it \
        --network none \
        --read-only --tmpfs /tmp \
        --cap-drop ALL --security-opt no-new-privileges \
        --user "$(id -u):$(id -g)" \
        --volume "$PWD:/app:ro" \
        --volume "$(realpath "$data"):/photos:ro" \
        --volume "$(realpath "$reports"):/reports" \
        pwsh-sandbox:7.5 "$script"
}
