#!/bin/bash
echo -e "\n\e[1;34m🚀 WritingDoc Engine is starting...\e[0m"
echo -e "\e[1;32m👉 Click to view your live docs: http://localhost:4242\e[0m\n"

# On lance Quarto en mode silencieux pour ne pas voir le 0.0.0.0 perturbant
quarto preview index.qmd --port 4242 --host 0.0.0.0 --no-browser
