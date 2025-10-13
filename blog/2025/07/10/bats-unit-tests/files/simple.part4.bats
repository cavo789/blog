#!/usr/bin/env bats

setup() {
    bats_load_library bats-support
    bats_load_library bats-assert
}

@test "Asserting it's hello" {
  run echo "hello"
  assert_output "hello"
  assert_success
}

@test "Simple.bats exists" {
  run ls simple.bats
  assert_output --regexp "[Ss]imple\.bats"
  assert_success
}

# highlight-start
@test "Removing an inexistent file" {
  run rm INEXISTENT_FILE
  assert_failure
}
# highlight-end
