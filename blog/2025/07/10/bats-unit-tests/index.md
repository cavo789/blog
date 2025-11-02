---
slug: bats-unit-tests
title: Linux - Bash scripts - Running unit tests with bats/bats
date: 2025-07-10
description: Learn how to effectively unit test your Bash scripts on Linux using the powerful bats (Bash Automated Testing System) framework. See practical examples for assertions, output checks, and failures.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: tests
tags: [linux, shell, tests]
language: en
blueskyRecordKey: 3lujtej7xhs23
---
<!-- cspell:ignore imple -->

![Linux - Bash scripts - Running unit tests with bats/bats](/img/v2/bash.webp)

Like all command-line developers, I write Linux Bash scripts.  Like any programmer, I'm supposed to write unit tests. Well, I have to admit that I rarely write them.

Some time ago, I wrote a set of Bash scripts that make up a library of functions (just like a framework) and here, the interest in having unit tests is even greater since these functions are supposed to be stable and can be used as foundations for more advanced scripts.

In this article, we look at how to write unit tests for Bash scripts.

<!-- truncate -->

## Let's start with a little hors d'oeuvre

Like always, first, we'll create a new folder so we can play with some examples.

Please run `mkdir -p /tmp/bats && cd $_` to create a temporary folder and jump in it; then run `code .` to start VSCode and open the folder.

We'll create a simple illustration file, let's call it `tests/simple.bats` and copy/paste the following content:

<Snippet filename="tests/simple.bats" source="./files/simple.bats" />

And now, the very difficult part is, ouch no, really easy in fact, to run [Bats-core](https://bats-core.readthedocs.io/en/stable/):

<Terminal>
$ docker run --rm -it -w /code/tests -v .:/code bats/bats:latest simple.bats
</Terminal>

And ... it works.

![Simple test](./images/simple_test.png)

### What did we do?

We've created a very basic example with two checks.

The first one is called *Asserting it's hello* and we've fired `echo "hello"` just like we can make in a Shell script. Then running `assert_output "hello"` we are checking the output of the fired command is `hello` and it's a success (so it's `hello` and nothing else)

This is done using this script:

<Snippet filename="tests/simple.bats" source="./files/simple.part2.bats" />

And the second check is called *Simple.bats exists* and we're just doing a `ls simple.bats` and check if, for the illustration, `Simple.bats` or `simple.bats` is returned in the list of file (this, to illustrate the use of a regular expression).

<Snippet filename="tests/simple.bats" source="./files/simple.part3.bats" />

### Asserting a failure

Of course we can also assert a failure. Edit your `simple.bats` file like this:

<Snippet filename="tests/simple.bats" source="./files/simple.part4.bats" />

So, in the new test function, we'll just try to remove a not-existing file and we expect, for sure, a failure:

![Asserting for a failure](./images/assert_failure.png)

## Some real-world use cases

Imagine the following, simplified, tree structure:

```tree expanded=true showJSX=false debug=false title=""
.
├── src
│   └── assert.sh
└── tests
    ├── assert.bats
```

The file `src/assert.sh` contains your Linux shell code you want to test. Your test scenario should be stored in the `tests` folder. Since we'll write tests for the `src/assert.sh` file, let's create the  `tests/assert.bats`.

Below the content of the `src/assert.sh`. Let's start with a simple function: checking if a given binary is installed on the system or not. The name of the binary has to be passed as a parameter to the function.

<Snippet filename="src/assert.sh" source="./files/assert.sh" />

Below the content of the `tests/assert.bats`.

<Snippet filename="tests/assert.bats" source="./files/assert.bats" />

The command line:

<Terminal>
$ docker run --rm -it -w /code/tests -v .:/code bats/bats:latest assert.bats
</Terminal>

By running it, we expect a success for the binaryExists for `clear` and `ls` commands (since well installed on our system) and we expect a failure for `fakeProgram` but, since we're using `assert_failure`, our tests scenario should work.

Let's add a check to see if a specific Docker image already exists or not on the system:

<Snippet filename="src/assert.sh" source="./files/assert.part2.sh" />

and the updated `tests/assert.bats` file:

<Snippet filename="tests/assert.bats" source="./files/assert.part2.bats" />

## Another examples

### assert_equal

Simply verify that both values are equals. Here, we'll call a function that will return the length of an array and verify it's the expected value.

<Snippet filename="tests/simple.bats" source="./files/simple.part5.bats" />

### assert_failure

`assert::binaryExists` will exit 1 if the binary can't be retrieved. An error message like *The binary can't be found will be echoed on the console*.

<Snippet filename="tests/simple.bats" source="./files/simple.part6.bats" />

### assert_output

`assert_output` has two nice options: `--partial` and `--regexp`.

Using `--partial` will allow f.i. the check if the output contains some raw text like, for a help screen, a given sentence.

<Snippet filename="tests/simple.bats" source="./files/simple.part7.bats" />

Using `--regexp` will allow to use a regular expression:

<Snippet filename="tests/simple.bats" source="./files/simple.part8.bats" />

### assert_success

`assert::binaryExists` will return 0 when the binary can be retrieved. The function will run in silent (no output).

<Snippet filename="tests/simple.bats" source="./files/simple.part9.bats" />

### Check for ANSI colors

Imagine the following code:

<Snippet filename="script.sh" source="./files/script.sh" />

We wish to check that the line will be echoed in red.

<Snippet filename="tests/simple.bats" source="./files/simple.part10.bats" />

### Check for multi-line output

Imagine the following code:

<Snippet filename="script.sh" source="./files/script.part2.sh" />

This will write three lines on the console, like f.i.

```bash
# ============================================
# = Step 1 - Initialisation                  =
# ============================================
```

To check for multi-lines, use the `$lines` array like this:

<Snippet filename="tests/simple.bats" source="./files/simple.part11.bats" />

### Check against a file

Imagine a function that will parse a file and f.i. remove some paragraphs. We need to check if the content is correct, once the function has been fired.

For this, imagine a `removeTopOfFileComments` function. The function will parse the file and remove the HTML comments (`<!-- ... -->`) present at the top of the file.

For the test, we'll create a file with three empty lines, then a HTML comment block, then two empty lines, then the HTML code. So, by removing the HTML comment, we'll have five empty lines followed by the HTML block so, we need to check our file contains six lines.

The tip used is:

* `cat --show-ends --show-tabs "$tempfile"` i.e. get the content of the file but with `$` where we've a line feed and, here, also `^I` for tabs.
* then we'll pipe the result with `tr "\n" "#"` so, instead of getting six lines, we'll get only one by replacing line feed by `#`.

Now, bingo, since we've a variable with only one line (in our example: `$#$#$#$#$#<html><body/></html>$#`), we can compare with our expectation:

<Snippet filename="tests/simple.bats" source="./files/simple.part12.bats" />

### Check against a file using a regex

A second scenario can be: you have a write function (think to a logfile) and you want to check the presence of a given line in the file.

The example below relies on `bats-file` and his `assert_file_contains` method. That method asks for a filename and a regex pattern.

<Snippet filename="tests/simple.bats" source="./files/simple.part13.bats" />

### Check that a value is NOT in a file

Another use of the assert_failure can be to start a command like a grep and expect to get an error:

```bash
run grep "REGEX_SOMETHING_THAT_SHOULD_BE_MISSING" "/tmp/test.log"
assert_failure 1
```

### Some special functions

#### setup

The `setup` function is called before running a test. For each `@test` function present in the scenario, the `setup()` function will be called.

In the following example, since there are two test functions, `setup()` will be called twice.

<Snippet filename="tests/simple.bats" source="./files/simple.part14.bats" />

#### teardown

Just like `setup`, the `teardown` function will be called for each test but once the test has been fired. This is the good place for, f.i., removing some files created during the execution of a test.

```bash
teardown() {
    rm -f /tmp/bats
}
```

### Running the tests

The command `docker run --rm -it -w /code/tests -v .:/code bats/bats:latest simple.bats` will run the `simple.bats` file while `docker run --rm -it -w /code/tests -v .:/code bats/bats:latest` will run all `.bats` file in the working directory.

#### Mocking

We can override a function during a test. Consider the following use case: we've a function that will return 0 when a give Docker image is present on the host. The function will return 1 and echo an error on the console if the image isn't retrieved.

<Snippet filename="script.sh" source="./files/script.part3.sh" />

So, we need to override the docker answer. When the image is supposed to be there, we just need to return a non-empty string, anything but not an empty string. Let's return a fake ID to really simulate the answer of `docker images -q`.

<Snippet filename="tests/simple.bats" source="./files/simple.part15.bats" />

And return an empty string to simulate an inexistent image.

<Snippet filename="tests/simple.bats" source="./files/simple.part16.bats" />