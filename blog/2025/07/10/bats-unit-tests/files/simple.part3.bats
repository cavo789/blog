@test "Simple.bats exists" {
  run ls simple.bats
  assert_output --regexp "[Ss]imple\.bats"
  assert_success
}
