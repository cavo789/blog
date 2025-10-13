@test "console::banner - The sentence should be displayed" {
    run console::banner "Step 1 - Initialisation"

    assert_equal "${lines[0]}" "============================================"
    assert_equal "${lines[1]}" "= Step 1 - Initialisation                  ="
    assert_equal "${lines[2]}" "============================================"

    assert_success
}
