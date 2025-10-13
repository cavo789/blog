#!/usr/bin/env bash

function __main() {

    clear

    # http://patorjk.com/software/taag/#p=display&f=Big&t=My%20Nice%20Script
    cat <<\EOF
  __  __         _   _ _             _____           _       _
 |  \/  |       | \ | (_)           / ____|         (_)     | |
 | \  / |_   _  |  \| |_  ___ ___  | (___   ___ _ __ _ _ __ | |_
 | |\/| | | | | | . ` | |/ __/ _ \  \___ \ / __| '__| | '_ \| __|
 | |  | | |_| | | |\  | | (_|  __/  ____) | (__| |  | | |_) | |_
 |_|  |_|\__, | |_| \_|_|\___\___| |_____/ \___|_|  |_| .__/ \__|
          __/ |                                       | |
         |___/                                        |_|

EOF
    printf "%s\n\n" "(c) Copyright ..."

    # Program the functions of your script here,
    # such as calling your functions

    return 0
}

__main $*
