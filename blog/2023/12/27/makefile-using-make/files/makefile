adminer:
  @printf "\e[1;033m%s\e[0m\n\n" "User is root and password is example. Please open http://127.0.0.1:%%port_adminer=8088%%?server=%%db=joomladb%%&username=root&db=joomla_db to open Adminer."
  @printf "\e[1;033m%s\e[0m\n\n" "Starting adminer. If the browser didn't open automatically, please surf to http://127.0.0.1:%%port_adminer=8088%%?server=%%db=joomladb%%&username=root&db=joomla_db to open adminer."
  docker run -d --rm --name adminer --link %%db=joomladb%%:db --network %%network=kingsbridge_default%% -p %%port_adminer=8088%%:8080 adminer
  -sensible-browser http://localhost:%%port_adminer=8088%% &

bash:
  @printf "\e[1;033m%s\e[0m\n\n" "Start an interactive shell in the Joomla Docker container; type exit to quit"
  docker compose exec joomla /bin/sh

code:
  code .

down:
  docker compose down

explorer:
  explorer.exe .

kill:
  docker compose kill

logs:
  docker compose logs --follow

start:
  @printf "\e[1;033m%s\e[0m\n\n" "Starting your website. If the browser didn't open automatically, please surf to http://127.0.0.1:%%port=8080%% to open your site."
  -sensible-browser http://localhost:%%port=8080%% &

up:
  docker compose up --detach

phpmyadmin:
  @printf "\e[1;033m%s\e[0m\n\n" "User is root and password is example. Please open http://127.0.0.1:%%port_phpmyadmin=8089%% to open phpmyadmin."
  @printf "\e[1;033m%s\e[0m\n\n" "Starting phpmyadmin. If the browser didn't open automatically, please surf to http://127.0.0.1:%%port_phpmyadmin=8089%% to open phpmyadmin."
  docker run --name phpmyadmin -d --link %%db=joomladb%%:db --network %%network=kingsbridge_default%% -p %%port_phpmyadmin=8089%%:80 phpmyadmin
  -sensible-browser http://localhost:%%port_phpmyadmin=8089%% &
