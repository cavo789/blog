@test "Assert binary exists" {
    run assert::binaryExists "clear" # clear is a native Linux command
    assert_output ""                 # No output when success
    assert_success
}

function assert::binaryExists() {
    local binary="${1}"
    local msg="${2:-${FUNCNAME[0]} - File \"$binary\" did not exist}"

    [[ -z "$(which "$binary" || true)" ]] && echo "$msg" && exit 1

    return 0
}
