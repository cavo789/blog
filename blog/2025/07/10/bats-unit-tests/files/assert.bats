#!/usr/bin/env bats

setup() {
    bats_load_library bats-assert
    bats_load_library bats-support

    source ./../src/assert.sh

    # Create a dummy file every time a test function is called
    tmpFile="/tmp/bats/assert.tmp"
    [[ ! -d "/tmp/bats" ]] && mkdir "/tmp/bats"

    touch "${tmpFile}"
}

# Once the test function has been called, remove the temporary
teardown() {
    [[ -f "${tmpFile}" ]] && rm -f "${tmpFile}"
    return 0
}

@test "assert::binaryExists - Assert some binaries exists" {
    # clear is a native Linux command
    run assert::binaryExists "clear"

    # We expect thus binaryExists return a zero exit code (=success)
    assert_success

    # and no output message since it's successful
    assert_output ""


    # Another test with the native ls command
    run assert::binaryExists "ls"
    assert_output ""
    assert_success
}

@test "assert::binaryExists - Assert some binaries didn't exist" {
    run assert::binaryExists "fakeProgram"

    # Since fakeProgram didn't exist, we expect binaryExists exit with code 1
    assert_failure 1

    # We also expect this, exact, error message
    assert_output "The fakeProgram binary wasn't found on your system."
}
