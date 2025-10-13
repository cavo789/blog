@test "Asserting it's hello" {
  run echo "hello"
  assert_output "hello"
  assert_success
}
