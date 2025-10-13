setup() {
    bats_load_library bats-support
    bats_load_library bats-assert
    bats_load_library bats-file

    #! "grep" without the "-P" argument seems to not support repetition like "\d{4}"
    #
    # a date like `2022-04-07`
    regexDate="[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-9][0-9]"
    # a time like `17:41:22`
    regexTime="[0-9][0-9]\:[0-9][0-9]\:[0-9][0-9]"
    # a time zone difference like "0200"
    regexUTC="[0-9]*" #! Should be [0-9][0-9][0-9][0-9] but didn't work???

    # The final pattern so we can match f.i. `[2022-04-07T18:00:20+0200] `
    __DATE_PATTERN="\[${regexDate}\T${regexTime}\+${regexUTC}.*\]\s"

    return 0
}

@test "log::write - Write a line in the log" {
    local sentence=""
    sentence="This is my important message"
    run write "${sentence}"

    assert_file_exist "/tmp/bats_log.tmp"

    echo "${__DATE_PATTERN}${sentence}" >/tmp/regex.tmp
    assert_file_contains "/tmp/bats_log.tmp" "${__DATE_PATTERN}${sentence}"
    assert_success
}
