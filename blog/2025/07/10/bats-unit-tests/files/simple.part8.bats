@test "Show the help screen" {
    source 'src/helpers.sh'
    arrArguments=("--input InvalidFile")
    run helpers::__process ${arrArguments[@]}
    assert_output --regexp "ERROR - The input file .* doesn't exist."
}
