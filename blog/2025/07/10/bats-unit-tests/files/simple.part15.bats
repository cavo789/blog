@test "Assert docker image exists" {
    # Mock - we'll create a very simple docker override and return a fake ID
    # This will simulate the `docker images -q "AN_IMAGE_NAME"` which return
    # the ID of the image when found
    docker() {
        echo "feb5d9fea6a5"
    }

    source assert.sh
    run assert::dockerImageExists "A-great-Docker-Image"
    assert_output "" # No output when success
    assert_success
}
