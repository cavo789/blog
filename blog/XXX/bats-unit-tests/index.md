---
slug: bats-unit-tests
title: Linux - Bash scripts - Running unit tests with bats
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [linux, shell, tests]
enableComments: true
draft: true
---
![Linux - Bash scripts - Running unit tests with bats](/img/bash_tips_banner.jpg)

My repo `https://github.com/cavo789/bash_unit_testing_using_bats`

The command line:

```bash
docker run --rm -it -v .:/code bats/bats:latest /code/tests/test.bats                     
```

The `tests/test.bats` file:

```bats
#!/usr/bin/env bats

setup() {    
    bats_load_library bats-support
    bats_load_library bats-assert
}

@test "My test using bats-assert" {
  run echo "hello"
  assert_output "hello"
  assert_success
}

@test "Another test" {
  run ls -l /
  assert_output --regexp "total.*"
}
```