#!/usr/bin/env bats

setup() {
  source "$BATS_TEST_DIRNAME/../backup.sh"
  TMP_SRC="$(mktemp -d)"
  TMP_DEST="$(mktemp -d)"
  touch "$TMP_SRC/file.txt"
}

teardown() {
  rm -rf "$TMP_SRC" "$TMP_DEST"
}

@test "backup_dir fails with no arguments" {
  run backup_dir
  [ "$status" -eq 1 ]
  [[ "$output" == *"Usage: backup_dir"* ]]
}

@test "backup_dir creates a timestamped archive" {
  run backup_dir "$TMP_SRC" "$TMP_DEST"
  [ "$status" -eq 0 ]
  [ -f "$output" ]
}
