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
