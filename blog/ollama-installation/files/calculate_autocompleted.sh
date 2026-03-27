#!/bin/bash

function calculate() {
    local num1=$1
    local num2=$2
    local operator=$3

    case $operator in
        "+")
            echo "$num1 + $num2 = $(($num1 + $num2))"
            ;;
        "-")
            echo "$num1 - $num2 = $(($num1 - $num2))"
            ;;
        "*")
            echo "$num1 * $num2 = $(($num1 * $num2))"
            ;;
        "/")
            if [ $num2 -ne 0 ]; then
                echo "$num1 / $num2 = $(($num1 / $num2))"
            else
                echo "Error: Division by zero is not allowed."
            fi
            ;;
        *)
            echo "Error: Invalid operator. Please use +, -, *, or /."
            ;;
    esac
}

function main() {
    if [ $# -ne 3 ]; then
        echo "Usage: $0 <num1> <num2> <operator>"
        echo "Example: $0 5 3 +"
        exit 1
    fi

    calculate "$1" "$2" "$3"
}

function help() {
    echo "This script performs basic arithmetic operations."
    echo "Usage: $0 <num1> <num2> <operator>"
    echo "Operators supported: +, -, *, /"
    echo "Example: $0 5 3 +"
}

if [[ "$1" == "help" ]]; then
    help
else
    main "$@"
fi
