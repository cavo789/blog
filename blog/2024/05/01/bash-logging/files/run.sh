#!/usr/bin/env bash

function test5() {
    log::write "I'm doing something in the test5 function..."

    return 0
}

function test4() {
    test5

    return 0
}

function test3() {
    test4

    return 0
}

function test2() {
    log::write "Doing some stuff in test2"

    test3

    return 0
}

function test1() {
    test2

    return 0
}

function __init() {
    source ./log.sh
    return 0
}

function __main() {
    __init

    log::write "Running main with these parameters: $*"

    echo "Welcome in this script"
    echo "Please do ..."

    test1

    return 0
}

__main $*
