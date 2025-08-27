---
slug: bash-parallel-task
title: Linux - Take advantage of the number of CPUs you have; start concurrent jobs
authors: [christophe]
image: /img/bash_tips_social_media.jpg
mainTag: bash
tags: [bash, linux, tips]
---
<!-- cspell:ignore bashpid, pids, nproc -->

![Linux - Take advantage of the number of CPUs you have; start concurrent jobs](/img/bash_tips_banner.jpg)

In my professional activity, I've been faced with the following requirement: process each line of a CSV file and make a POST API call to upload a document.

One line of the CSV contained information that needed to be communicated to an API service, and each line corresponded to a PDF file. So if there are 1000 lines in the CSV file, I have to make 1000 API calls to upload 1000 PDFs.

I wrote my script in Linux Bash and then it was time to optimise: not just one API call at a time, but as many as possible.

Let's how we can start more than one task at a time using Linux Bash.

<!-- truncate -->

Consider this small demo:

<Snippet filename="demo.sh">

```bash
#!/bin/bash

function demo {
    echo "Sleeping for 3 seconds..."
    sleep 3
    return 0
}

function main {
    for i in {1..10}; do
        demo
    done
}

start_time=$(date +%s)
main
end_time=$(date +%s)
total_time=$((end_time - start_time))
echo "Total running time: $total_time seconds"
```

</Snippet>

Before calling the `main` function, I remember the actual start time, call `main` then calculate the elapsed time in seconds.

The `main` function is quite basic here, I'll do a loop from 1 till 10 and, each time, call the `demo` function. That function will sleep for 3 seconds.

So, by running the script, since we're calling ten times our demo function and the function is waiting for three seconds, then, we'll not be surprises by the total duration time:

<Terminal>
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...

Total running time: 30 seconds
</Terminal>

:::important Hey dude! I've more than one CPU
But, that's code is so old fashion now? How many CPU did I have? Just one? Oh thank you computer gods, I've got more than that!  So, why just using one?
:::

## Now, the optimised version

Ok, now, we'll not start our function in a sequential order but we'll call it once and **don't wait until the function is finished**, we'll continue our loop and call the same function as a second time, a third time, ...

We just need to make sure we'll not kill our performances and for this, we'll retrieve the number of CPU cores we've on the machine. In Linux, this is very easy: the `nproc` command will do this.

On my computer, I've 32 logical processors and since I can start 2 threads by CPU, I can calculate the maximum number of threads like this: `NUMBER_OF_THREADS=$(( $(nproc) * 2 ))`.

:::tip Also pay attention to some limitation imposed by the third party
In the Bash script below, no problem, it's just my computer but in my introduction, I've mentioned, "I need to call an API POST service". Here, I just make sure I will not be blacklisted by the web server. For instance, perhaps, there is a limitation like "Not more than 32 calls in a second for the same IP". In that case, I should take this info into account and don't start more than 32 process at a time (I'll then set `NUMBER_OF_THREADS=32`).
:::


We'll adapt our sample like this:

<Snippet filename="demo.sh">

```bash
#!/bin/bash

function demo {
    echo "Sleeping for 3 seconds..."
    sleep 3
    return 0
}

function main {
    # highlight-next-line
    # Array to store the PIDs of every jobs started in background
    # highlight-next-line
    declare -a pids
    # highlight-next-line
    pids=()

    # highlight-next-line
    # Get the number of logical cores on the machine and multiply by 2
    # highlight-next-line
    # So if the machine has 4 cores, we'll start 8 threads in the same time
    # highlight-next-line
    NUMBER_OF_THREADS=$(( $(nproc) * 2 ))
    # highlight-next-line

    # highlight-next-line
    echo "Number of threads: ${NUMBER_OF_THREADS}"
    # highlight-next-line

    for i in {1..10}; do
        # highlight-next-line
        # Run our function in the background; don't wait that the function finish
        # highlight-next-line
        demo &

        # highlight-next-line
        # Remember the pid i.e. the ID of the function we've just started
        # highlight-next-line
        pids+=($!)

        # highlight-next-line
        # As soon as we've started the max of concurrent threads; wait and allow all of them to finish.
        # highlight-next-line
        if [[ $( jobs | wc -l ) -ge ${NUMBER_OF_THREADS} ]]; then
            # highlight-next-line
            for pid in "${pids[@]}"; do
                # highlight-next-line
                wait "${pid}"
                # highlight-next-line
            done
            # highlight-next-line

            # highlight-next-line
            # And reset the array since all jobs are done
            # highlight-next-line
            pids=()
            # highlight-next-line
        fi
    done

    # highlight-next-line
    # And now, make sure all parallel jobs are finished
    # highlight-next-line
    for pid in "${pids[@]}"; do
        # highlight-next-line
        wait "${pid}"
       # highlight-next-line
    done
}

start_time=$(date +%s)
main
end_time=$(date +%s)
total_time=$((end_time - start_time))
echo "Total running time: $total_time seconds"
```

</Snippet>

### In depth

By adding the `&` character, I'm asking Bash to now wait that the function finish his job before returning. So, the code below will run `demo` 10 times even before the first `demo` call is finished.

```bash
for i in {1..10}; do
    demo &
done
```

If I need to do 100, 500 or 1,000 calls, my computer will start to comply and, perhaps, didn't respond anymore. My computer can't handle 1,000 calls in the same time.

What should I do?

I know I've a specific number of cores (see the `nproc` command) and I know I can start two threads by cores *(so, in my situation, I can start 64 jobs in the same time)*

So before running the next call of `demo`, I need to do two things:

1. I'll keep the process id (`pid`) of the just fired `demo` function (each call has his own `pid`) and store that value in an array,
2. I'll need to check how many jobs are running and not yet finished (retrieved using `$( jobs | wc -l )`) and compare that number with the number of threads we can start (*64* for me). As soon as the number of running jobs is equal to my max, Ok, I should wait.  I shouldn't start a 65th job but I'll wait that all the previous 64 ones are finished.

And, when it's done, I can continue for the next wave and so one.

Finally, after the loop, I do the same i.e. make sure that all jobs defined in our `pids` array are done.

### How many seconds would I have waited?

Did you know how many times I need to wait? Remember, in the first version of the script, I've waited 30 seconds.

With the optimised version here above and to do **exactly the same thing**, I waited ... just three seconds:

<Terminal>
Number of threads: 64
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Sleeping for 3 seconds...
Total running time: 3 seconds
</Terminal>

:::tip Running 50 times the function
In the first version of the script, by changing the line `for i in {1..10}; do` to `for i in {1..50}; do`, I'll wait 150 seconds; right? With the optimised version, just 4 seconds. Why 4 and not 3? Probably some delay introduced by the processor (who should handle 50 concurrent threads).
:::
