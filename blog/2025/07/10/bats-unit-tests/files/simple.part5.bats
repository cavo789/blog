@test "array::length - Calculate the length of an array" {
    arr=("one" "two" "three" "four" "five")

    assert_equal $(array::length arr) 5
}

function array::length() {
    local -n array_length=$1
    echo ${#array_length[@]}
}
