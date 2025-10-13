setup() {
    bats_load_library bats-support
    bats_load_library bats-assert

    source 'src/env.sh'
}

@test "env::assertFileExists - Assert .env file exists - The path isn't initialised" {
    run env::assertFileExists
    assert_failure
}

@test "env::assertFileExists - Assert .env file exists - The file exists" {
    ENV_ROOT_DIR="/tmp"
    ENV_FILENAME=".env.bats.testing"
    touch ${ENV_ROOT_DIR}/${ENV_FILENAME}
    run env::assertFileExists
    assert_success
}
