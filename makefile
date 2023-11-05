SHELL:=bash

COLOR_YELLOW:=33

.PHONY: bash
bash: # Open an interactive shell in the Docker container
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash

.PHONY: code
code: # Open Visual Studio Code
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code"
	code .

.PHONY: build
build: # Generate a newer version of the build directory
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash -c "yarn build"

.PHONY: deploy
deploy: build # Deploy static pages to the webserver
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Deploy static pages to the webserver"	
	-"/mnt/c/Program Files (x86)/WinSCP/WinSCP.com" /script="WinSCP_deploy.txt"
	-@sensible-browser https://www.avonture.be

.PHONY: start
start: # Start the local webserver and open the webpage
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"	
	@sensible-browser http://localhost:3000

.PHONY: watch
watch: # Start the Docusaurus watcher. Listen any changes to a .md file and reflect the change onto the website
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Run Docusaurus watcher and open the blog on the localhost. When done, just start a browser and surf to http://localhost:3000"	
	docker run --rm -it --name blog --user $${UID}:$${GID} -v $${PWD}/:/project -w /project -p 3000:3000 node /bin/bash -c "npx docusaurus start --host 0.0.0.0"
