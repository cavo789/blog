@test "Assert binary didn't exist" {
    # Simulate which and return an error meaning "No, that binary didn't exist on the host"
    which() {
        exit 1
    }

    run assert::binaryExists "Inexistent_Binary" "Ouch, no, no, that binary didn't exist on the system"

    assert_failure

    assert_output --partial "Ouch, no, no, that binary didn't exist on the system"
}

function assert::binaryExists() {
    local binary="${1}"
    local msg="${2:-${FUNCNAME[0]} - File \"$binary\" did not exist}"

    [[ -z "$(which "$binary" || true)" ]] && echo "$msg" && exit 1

    return 0
}
