function assert::dockerImageExists() {
    local image="${1}"
    local msg="${2:-The Docker image \"$image\" did not exist}"

    # When the image exists, "docker images -q" will return his ID (f.i. `5eed474112e9`), an empty string otherwise
    [[ "$(docker images -q "$image" 2>/dev/null)" == "" ]] && echo "$msg" && exit 1

    return 0
}
