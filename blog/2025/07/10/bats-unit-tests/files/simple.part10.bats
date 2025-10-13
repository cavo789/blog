@test "console::printRed - The sentence should be displayed" {
    run console::printRed "This line should be echoed in Red"
    assert_output "�[1;31mThis line should be echoed in Red�[0m"
    assert_success
}
