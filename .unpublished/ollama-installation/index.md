---
slug: ollama-installation
title: Installing Ollama and get local AI
authors: [christophe]
image: /img/v2/playing_with_ollama.webp
mainTag: ai
draf: true
tags: [ai, ollama]
date: 2026-12-31
---

![Installing Ollama and get local AI](/img/v2/playing_with_ollama.webp)

In one of my last article about my <Link to="/blog/gemini-tldr">TL;DR summary</Link> component, I've created a Python script to consume Gemini API and boum, after just a few requests, I got a maximum quota exceeded error.

What if we can solve this for free? How? Simply by installing a LLM locally, on our host. No more quota.

## Did you need a local LLM?

Probably the most important reason is privacy: having it locally, on your host, means that your documents stays on your computer.  You'll not share your codebase f.i. with AI companies.

You can also think to automation: you'll be able to run automation scripts without the fear to reach any quota. You'll not pay for your consumption too.

## Installing Ollama and run it

You know, as a Docker lover, I'll not install Ollama by hand.

Let's create the `compose.yaml` file on your disk. I use a few Docker containers every day, and I save their configuration files in a `~/tools` folder; let’s do the same here.

Run `mkdir ~/tools/ollama && cd $?` then create a `compose.yaml` with this content:

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={false} />

Still in the `~/tools/ollama` folder, simply run `docker compose up --detach` to download ollama and run it as a Docker container.

## Download a LLM model

First, you've to think about your use. Most probably you'll expect speed and accuracy.

For speed, you've to use a "small" LLM like `llama3.1:8b`. Let's take an example: you plan to use a VSCode extension and, you then need speed for autocompletion.

For accuracy, you are OK to wait a few more in order to get better result.

First, pay attention to how many free RAM you've.

```bash
$ free -h
               total        used        free      shared  buff/cache       available
Mem:            15Gi       5.4Gi       2.4Gi       9.7Mi       7.8Gi       9.9Gi
Swap:          4.0Gi        11Mi       4.0Gi
```

Look at the last column **available**.  I've actually ~10GB free so I can easily choose for a model ~4.7GB like `llama3.1:8b`.

Start a new terminal and run this command:

<Terminal wrap={true}>
$ docker exec -it ollama ollama pull llama3.1:8b
</Terminal>

<AlertBox variant="note" title="We're using Docker right?">

Since we've installed ollama as a Docker container, we've to use the `docker exec -it ollama` syntax then the ollama CLI.

This is why, f.i. we're running `docker exec -it ollama ollama pull llama3.1:8b`.

</AlertBox>

If you run `free -h` again, look at the `Available` column again. I had ~9.9G before, now I've ~5.5G.

### More power needed?

There are a lot of models available, look at the suffix at the end of `llama3.1:8b` f.i. `8b` means 8 billion of parameters. The more you can have the more knowledge you'll get but, it has a price: the size.

If you've more than 32GB of RAM you can certainly also use `gemma2:27b` (27 billion of parameters, around ~17G), `mixtral:8x7b` (around ~26G) or `llama3:70b` (70 billion of parameters, ~45GB).

The higher, the better result but, too, the higher, the slower. You've to determine for your own use case (your hardware, your GPU, your need, ...) one or two LLM you'll use.

For instance, a very fast one (so small one) for interactions: you don't want to wait 30 seconds before getting an answer and a more powerful one for heavy tasks like code refactoring, generating some codebase, ...

#### What Does 8x7b Mean?

If you look at mixtral, you'll notice the `8x7b` suffix. This indicates that the model uses a **Mixture of Experts** (MoE) architecture, meaning it is **composed of 8 distinct expert neural networks, each with 7 billion parameters**.

When you use this type of model, a built-in router first analyzes your prompt to determine which experts are best equipped to answer.

Let's look at an example: imagine you ask Mixtral to generate a Python function. First, the router processes the context of your question. Then, it seamlessly activates only the most relevant experts for that specific task (typically just two out of the eight) to generate the best possible answer.

Because it selectively uses its experts, mixtral is an incredibly versatile and highly efficient model—provided your machine has enough RAM to load the entire framework into memory!

### Getting the list of models

If you want to retrieve models you've already installed:

<Terminal wrap={true}>
$ docker exec -it ollama ollama list
</Terminal>

The entire list of existing models in online: [https://ollama.com/library](https://ollama.com/library)

## Try it in your terminal

The command to run is `ollama run <model_name>` so, if you've followed this tutorial, our command would be `docker exec -it ollama ollama run llama3.1:8b`.

<Terminal wrap={true}>
$ docker exec -it ollama ollama run llama3.1:8b
</Terminal>

You can now start to ask anything.

<Terminal wrap={true}>
$ Can you create a very simple one-line CLI for retrieving a joke from a free online API? I want a simple curl statement, asking for plain text and show the joke in my terminal

Here is a simple one-liner using curl to fetch a random joke from the Chuck Norris Joke API:

curl -s https://api.chucknorris.io/jokes/random | jq '.value' | sed 's/"//g'

Let me explain what each part does:

* curl -s: Sends an HTTP GET request to the specified URL, and suppresses progress meter and error messages.
* https://api.chucknorris.io/jokes/random: This is the API endpoint that returns a random Chuck Norris joke. The response will be in JSON format.
* jq '.value': Extracts only the joke text from the JSON response.
* sed 's/"//g': Removes double quotes surrounding the joke text.

You can run this command in your terminal to get a random Chuck Norris joke!

Note: Make sure you have jq installed on your system, as it is used for parsing and transforming JSON data. If you don't have it, you can install it with your package manager (e.g., apt-get install jq on Ubuntu-based systems).
</Terminal>

Type `/bye` to exit.

<AlertBox variant="info" title="Faster the second time">

You've experienced some delay right before getting the prompt? Run the exact same command again; you'll see, it's now immediate since the model is already loaded in RAM.

And, if you don't use the model anymore the next five minutes, ollama will unload it so you'll retrieve your RAM.

</AlertBox>

### Should I speak English with the model?

In fact, no. Just like using a webpage; you can speak your own language:

can now start to ask anything.

<!-- cspell:disable -->
<Terminal wrap={true}>
$ Pourrais-tu me dire quel temps il faut aujourd'hui à Bruxelles?

Je peux t'aider à trouver la météo actuelle à Bruxelles !

Il existe plusieurs façons de faire cela, mais je vais te suggérer quelques options : [...]
</Terminal>
<!-- cspell:enable -->

## Using a web interface

You can download a WebGUI to interact with Ollama and the most used one is **Open WebUI**

Let's edit our `compose.yaml` file and add a new service:

<Snippet filename="compose.yaml" source="./files/compose_webui.yaml" defaultOpen={true} />

Run `docker compose up --detach` to download the open-webui image (~1.7G) and create the container.

Now, simply surf to `http://localhost:4000` and you'll have your interface and, you can start to interact with your local LLM.

Pay attention top left: you can see there the list of installed models.

## Using a VSCode extension

If you want to add AI in VSCode, you can install [Continue - open-source AI agent](https://marketplace.visualstudio.com/items?itemName=Continue.continue).

Continue requires a `config.json` file **in your Windows home folder**; not WSL side.

Start a Powershell terminal, run `cd ~/.continue ; notepad config.json` and paste the content of this file:

<Snippet filename=".continue/config.json" source="./files/continue/config.json" defaultOpen={false} />

Restart VSCode again or, in the Continue pannel, fin the `Local config` option and select `Refresh`.

When you'll see your model name in the list of loaded models, Continue is ready to manage your first question.

### Using autocompletion

When you're typing some text in VSCode, you wish immediate autocompletion and not to wait one second or more.

For this, you'll need to use a fastest model; let's use `qwen2.5-coder:1.5b`  (1.5 billion of parameters, around ~1G).

<Terminal wrap={true}>
$ docker exec -it ollama ollama pull qwen2.5-coder:1.5b
</Terminal>

Update your `.continue/config.json` file (on Windows side) with this new content:

<Snippet filename=".continue/config.json" source="./files/continue/config_with_autocompletion.json" defaultOpen={false} />

### With a better LLM

You've a powerfull CPU and/or GPU with 32GB or more, you can also add a better model `gemma2:27b` (27 billion of parameters, around ~17G):

<Snippet filename=".continue/config.json" source="./files/continue/config_with_expert.json.json" defaultOpen={false} />

<Terminal wrap={true}>
$ docker exec -it ollama ollama pull gemma2:27b
</Terminal>

This model will be much more accurate, but also slower. Save it for intensive code analysis tasks such as code refactoring, generating complex unit tests, and so on.

## Bonus

### Freeing Up RAM with ollama stop

If you ever need to instantly reclaim your system's memory, you can force a model to unload by running `docker exec -it ollama ollama stop <model_name>`.

However, this manual step usually isn't necessary, as Ollama is designed to automatically unload models from your RAM after a few minutes of inactivity. It's simply a handy command to keep in your back pocket for those times you need immediate control over your resources!

### Remove a model

Simply run `docker exec -it ollama ollama rm <model_name>`.

### .wslconfig file

If you're a WSL2 user, it's a good idea to create a `.wslconfig` file in your Windows partition in order to specify a few default settings for WSL like how many (max) RAM he can eat.

On my host, I use these settings:

<Snippet filename=".wslconfig" source="./files/.wslconfig" defaultOpen={true} />

To create this file, simply start a new Powershell terminal, run `cd ~` to go in your home directory (at Windows level) and run `notepad .wslconfig` to open that file (and create it if needed).

<AlertBox variant="tip">

Think to run `wsl --shutdown` in a Powershell console if you've created/updated the `.wslconfig` file.

</AlertBox>
