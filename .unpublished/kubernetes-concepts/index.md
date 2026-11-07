---
slug: kubernetes-concepts
title: "Kubernetes for Docker Users: What It Solves, and Whether You Need It"
authors: [christophe, claude]
image: /img/v2/docker_concepts.webp
mainTag: docker
tags: [docker, linux, self-hosted]
date: 2026-11-06
description: "If you know Docker Compose, you already understand half of Kubernetes. The problems it solves, its concepts mapped to what you know, and an honest answer on whether you need it."
series: Kubernetes first steps
ai_assisted: true
draft: true
---

![Kubernetes for Docker Users: What It Solves, and Whether You Need It](/img/v2/docker_concepts.webp)

<TLDR>
Docker Compose runs your containers on one machine and stops there. Kubernetes manages them across several machines, and constantly repairs the difference between what you asked for and what's actually running. This article maps its concepts to what you already know from Compose, and helps you decide honestly whether you need it, because many projects don't.
</TLDR>

Your Compose stack runs perfectly on your server. Then the server reboots at 3 AM, or the traffic doubles, or you want to deploy without a two-minute outage. And somebody at the coffee machine says: "You should use Kubernetes." But should you really? And what is it, beyond a word that comes with a lot of YAML?

By the end of this article, you will know which problems it solves, how it maps to what you already know, and whether it's worth your time.

<!-- truncate -->

## The Whole Idea in One Picture

With Compose, you give an order and it's carried out once. With Kubernetes, you state a wish, and a loop keeps checking it, forever:

```plaintext
You:         "I want 3 copies of this image"
                      │
                      ▼
           ┌──── Is it true right now? ◄────┐
           │                                │
    only 2 are running                 all is fine
           │                                │
           ▼                                │
    start 1 more copy ───────────────────────┘
```

Here's that loop at work, on a real cluster. One copy of the application is deleted, and a new one appears, without anyone asking:

<Terminal>
{`$ kubectl delete pod hello-5945bf4f6f-jwnkn
pod "hello-5945bf4f6f-jwnkn" deleted from default namespace

$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
hello-5945bf4f6f-qz8fq   1/1     Running   0          7s
hello-5945bf4f6f-sptd7   1/1     Running   0          1s
hello-5945bf4f6f-zvb5t   1/1     Running   0          7s`}
</Terminal>

You can run exactly this yourself, with nothing to install, in the <Link to="/blog/kubernetes-mini-lab-kind">Kubernetes mini-lab</Link>. Everything else follows from this loop.

## What Compose Doesn't Do

Compose is excellent, and I use it every day. These are the walls you eventually hit when your project grows:

| Need | Docker Compose | Kubernetes |
| --- | --- | --- |
| Run on several machines | One host | A cluster of nodes |
| A machine dies | Everything on it stops | Its workloads are recreated elsewhere |
| Add copies | `--scale`, on the same machine | One number, spread across nodes |
| Update without downtime | Up to you to organize | Built-in progressive rollout |
| A release goes wrong | Up to you | The rollout stops, and `rollout undo` reverts it |
| Send traffic to healthy copies | Up to you | Built-in with Services and probes |

Compose can restart a crashed container with `restart: always`, and it can wait for a <Link to="/blog/docker-health-condition">health condition</Link> at startup. What it can't do is move your work to another machine.

## The Concepts, from What You Already Know

Five words get you through most conversations:

| Kubernetes | Closest Compose idea | In one sentence |
| --- | --- | --- |
| **Pod** | A running container | The smallest unit; usually one container, and it's disposable |
| **Deployment** | A `service` with its `image` and `replicas` | Keeps the desired number of Pods alive and manages updates |
| **Service** | The service name on the network | A stable address in front of Pods that come and go |
| **Node** | The Docker host | A machine in the cluster |
| **ConfigMap / Secret** | `environment` and `secrets` | Configuration kept separate from the image |

Compare a Compose file with its equivalent, and the family resemblance is obvious. Same image, same number of copies, simply more explicit:

```yaml title="compose.yaml"
services:
  hello:
    image: nginx:1.29-alpine
    deploy:
      replicas: 3
```

```yaml title="hello.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: web
          image: nginx:1.29-alpine
```

Those `labels` are the only real newcomer: this is how a Deployment recognizes "its" Pods, and how a Service finds where to send traffic. Your Docker images themselves don't change at all, and that's the good news: everything you've learned about <Link to="/blog/docker-prod-devcontainer">building images</Link> remains valid.

## Do You Need It?

My honest answer: often, no.

**Stay with Compose if** you have one server, a small team and a site that can tolerate a short interruption during a deployment. It's simple and cheap, and you can understand all of it. A personal blog, an internal tool or a home lab all belong here.

**Consider Kubernetes if** your application must keep running when a machine fails, your load varies a lot, several teams deploy independently, or your company already runs a cluster and you simply want to understand what's going on.

And count the cost. A cluster is itself a system to run, upgrade and monitor, and managed offers from cloud providers remove part of this work but not the learning curve. It's a real investment, so it should pay for a real problem.

Learning it, on the other hand, costs very little, as you can see in the next article.

## Conclusion

At the beginning of this article, Kubernetes was a word from the coffee machine. It's really one idea, a loop that makes reality match your wish, along with a handful of objects to express that wish. If your Compose stack does the job, keep it, and sleep well. But now try the <Link to="/blog/kubernetes-mini-lab-kind">mini-lab</Link>: fifteen minutes in a throwaway cluster will teach you more than any comparison table, including this one.
