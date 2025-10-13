@test "Show the help screen" {
    source 'src/helpers.sh'

    arrArguments=("--help")

    run helpers::showHelp ${arrArguments[@]}

    assert_output --partial "Convert a revealJs slideshow to a PDF document"
}
