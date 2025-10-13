@test "Assert docker image didn't exist" {
    # Mock - we'll create a very simple docker override and return a fake ID
    # This will simulate the `docker images -q "AN_IMAGE_NAME"` which return
    # the ID of the image when found; here return an empty string to simulate
    # an inexistent image
    docker() {
        echo ""
    }

    source assert.sh
    run assert::dockerImageExists "Fake/image" "Bad choice, that image didn't exist"
    assert_output --partial "Bad choice, that image didn't exist"
    assert_failure
}
