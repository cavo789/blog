#!/usr/bin/env bash

clear

if [ ! -f patterns.json ]; then
    echo "Please create a patterns.json file."
    echo "Run 'cp patterns.json.dist patterns.js' to use an example."
    exit 1
fi

rm -f roundcube.sieve && touch roundcube.sieve

cat patterns.json \
    | jq '.patterns[]' \
    | sort \
    | while read -r pattern; do \
        # Trim quotes
        pattern=$(echo "$pattern" | tr -d '"')
        # Read the spam.template file, make the replace and append in file roundcube.sieve
        sed "s/{{ pattern }}/${pattern}/g" spam.template >>roundcube.sieve; \
    done

echo "File roundcube.sieve has been created. Now, you've to publish it on your FTP."
