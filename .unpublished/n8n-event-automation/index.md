---
slug: n8n-event-automation
title: "n8n: Self-Hosted Automations That Run Without You"
authors: [christophe, claude]
image: /img/v2/workflows.webp
mainTag: self-hosted
tags: [self-hosted, docker, github, gitlab]
date: 2026-11-07
description: "n8n reacts to webhooks, schedules and RSS feeds while you do something else. Run it in Docker, and turn GitHub and GitLab CI failures into one common alert format with a ready-made workflow."
ai_assisted: true
draft: true
---

![n8n: Self-Hosted Automations That Run Without You](/img/v2/workflows.webp)

<TLDR>
Scripts and AI commands wait for you to launch them. n8n is a self-hosted automation tool that starts on its own when an event happens: a webhook, a schedule, a new RSS item. This article runs it in Docker with a ready-made workflow that turns GitHub and GitLab CI notifications into one common format, then shows how to go further.
</TLDR>

My terminal is full of useful commands. They all share one flaw: they only do something when I think of typing them. Did that pipeline fail an hour ago? Is that disk almost full? Nobody tells me, because nobody's watching. And writing one more little server just to receive a webhook isn't how I want to spend my evening.

By the end of this article, you'll have a service on your machine that receives events from your CI and handles them with no help from you.

<!-- truncate -->

## Seeing It in Action with Docker

*Already run n8n? [Skip to building your own workflow](#open-the-editor) — this chapter is only a throwaway container to try it risk-free.*

GitHub and GitLab describe a failed pipeline in two completely different JSON documents. Here, we send both to the same address, and one uniform alert comes back each time:

<Terminal>
{`$ curl -s -X POST http://localhost:5678/webhook/ci -H 'Content-Type: application/json' -d @github.json | jq -r .message
GitHub: cavo789/my-app (main) is failure

$ curl -s -X POST http://localhost:5678/webhook/ci -H 'Content-Type: application/json' -d @gitlab.json | jq -r .message
GitLab: team/billing (develop) is failed`}
</Terminal>

That's the payoff: from now on, a single place understands both of your CI systems. To reproduce this, create these files in an empty folder:

<ProjectSetup folderName="n8n-demo">
  <Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />
  <Snippet filename="ci-alerts.json" source="./files/ci-alerts.json" defaultOpen={false} />
  <Snippet filename="github.json" source="./files/github.json" defaultOpen={false} />
  <Snippet filename="gitlab.json" source="./files/gitlab.json" defaultOpen={false} />
</ProjectSetup>

Build the image and start it. Allow it about thirty seconds, until the log says `Editor is now accessible`:

<Terminal>
{`$ docker build -t n8n-demo .
$ docker run --rm --name n8n-demo -p 127.0.0.1:5678:5678 n8n-demo`}
</Terminal>

In a second terminal, in the same folder, run the two `curl` commands above. If you don't have `jq`, remove the end of the command, and you'll see the entire JSON.

## Why This Is Different from a Script

- A workflow begins with a **trigger**, so it runs when something happens and not when you remember it.
- Each step is a **node**, so you can see the data going in and out of each step when you're looking for what went wrong.
- It's self-hosted: your workflows, your execution data and your credentials stay on your own infrastructure.

## Open the Editor

With the container still running, open [http://localhost:5678](http://localhost:5678). n8n first asks you to create a local owner account, and then you'll find the `CI alerts` workflow: two boxes joined by an arrow.

- **CI webhook** receives the POST request.
- **Normalize** is a few lines of JavaScript that detect the origin and keep only the five fields that matter.

Open the `Normalize` node and change the `message` format. Publish your change, send the same `curl` again, and the answer follows. That's the whole work cycle, and it's much faster than deploying a script.

## Make It Permanent

The demo image forgets everything when it stops. For real use, replace it with the official image and a named volume, which keeps your workflows and your account:

```yaml title="compose.yaml"
services:
  n8n:
    image: n8nio/n8n:2.46.6
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - GENERIC_TIMEZONE=Europe/Brussels
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

<AlertBox variant="warning" title="A webhook is a public door">
To receive events from GitHub or GitLab, this address must be reachable from the internet. Put it behind HTTPS, set the `WEBHOOK_URL` variable, and protect each webhook with the authentication option of the node. Your n8n instance stores credentials for your services, so it deserves the same care as any other sensitive server.
</AlertBox>

## Ideas to Steal

These follow the same recipe, from the simplest to the most complete. Each one is a trigger, a little processing, and an action. I built only the CI one here, so consider the others as starting points:

1. **Complete the CI alert.** After `Normalize`, add a Filter node to keep only failures, then a Slack, Discord or e-mail node with your credentials.
2. **Watch your own links.** A Schedule Trigger, then an HTTP Request node on a list of URLs, and an alert for anything other than a 200. No AI is involved, only a nightly mechanical check.
3. **Announce your new posts.** An RSS trigger on your blog's feed, then a call to the API of your favorite network. If you've added <Link to="/blog/docusaurus-bluesky-share">Bluesky sharing</Link> to your blog, this closes the loop on the author's side.
4. **A morning digest of your stack.** A schedule at 8 AM, calls to the HTTP APIs of your services, one summary message. Combine it with a <Link to="/blog/docker-health-condition">health check</Link> on each service, and you only have to read the summary.

Is it better than a script? For one small task, a cron job and a few lines of Bash are often simpler, and I keep them. n8n earns its place once you connect several services, want to see each execution, and would rather not maintain the plumbing.

## Conclusion

At the beginning of this article, my automations waited for me to type them. With n8n, an event is enough: a webhook arrives, the workflow runs, and I'm told only when it matters. Start with the demo, change the message, then connect the one alert you wish you had received last week. That first notification arriving while you're doing something else is what makes it click.
