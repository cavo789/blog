---
slug: kubernetes-mini-lab-kind
title: "Kubernetes Mini-Lab: Kill a Container and Watch It Come Back"
authors: [christophe, claude]
image: /img/v2/docker_concepts.webp
mainTag: docker
tags: [docker, linux, self-hosted]
date: 2026-11-07
description: "Run a real three-node Kubernetes cluster inside Docker with kind. Deploy an app, delete a container, scale to six replicas and roll back a bad release, in a 15-minute lab with nothing to install."
series: Kubernetes first steps
ai_assisted: true
draft: true
---

![Kubernetes Mini-Lab: Kill a Container and Watch It Come Back](/img/v2/docker_concepts.webp)

<TLDR>
Reading about Kubernetes rarely makes it click; watching it repair your application does. This lab starts a real three-node cluster as Docker containers with `kind`, using a throwaway toolbox with nothing installed on your machine. You deploy Nginx, delete a Pod, scale up, and survive a broken release, then a single command removes everything.
</TLDR>

Everybody talks about self-healing and scaling, and you nod politely. But what does it look like when you type the commands? In a few minutes, you'll have seen it for yourself, on your own machine, without a cloud account or a single installation.

<!-- truncate -->

## The Moment It Clicks

*New to the vocabulary? <Link to="/blog/kubernetes-concepts">The companion article</Link> explains the concepts. You can read it before or after this lab.*

An application is running, with three copies. We delete one on purpose, and straight away a replacement is there, with a new name, one second old:

<Terminal>
{`$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
hello-5945bf4f6f-jwnkn   1/1     Running   0          6s
hello-5945bf4f6f-qz8fq   1/1     Running   0          6s
hello-5945bf4f6f-zvb5t   1/1     Running   0          6s

$ kubectl delete pod hello-5945bf4f6f-jwnkn
pod "hello-5945bf4f6f-jwnkn" deleted from default namespace

$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
hello-5945bf4f6f-qz8fq   1/1     Running   0          7s
hello-5945bf4f6f-sptd7   1/1     Running   0          1s
hello-5945bf4f6f-zvb5t   1/1     Running   0          7s`}
</Terminal>

Nobody asked for that new container. We only ever said "I want three of them", and the cluster keeps that promise. Let's reproduce it on your machine.

## Step 1: Start the Cluster

This image holds `kind` (*Kubernetes in Docker*), `kubectl`, and the two YAML files of the lab:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

<AlertBox variant="warning" title="The Docker socket gives full control">
The toolbox starts the cluster's containers through `/var/run/docker.sock`, and this gives it control over your Docker daemon. Read the Dockerfile above, and use this lab for learning, on your own machine.
</AlertBox>

Save the file in an empty folder, then build the image, create the network used by the cluster and enter the toolbox:

<Terminal wrap={true}>
$ docker build -t k8s-lab .
$ docker network create kind
$ docker run --rm -it --network kind -v /var/run/docker.sock:/var/run/docker.sock k8s-lab
</Terminal>

Now create the cluster. Allow about a minute the first time, and about 4 GB of free memory:

<Terminal>
{`$ lab-up
$ kubectl wait --for=condition=Ready nodes --all --timeout=120s
$ kubectl get nodes
NAME                STATUS   ROLES           AGE   VERSION
lab-control-plane   Ready    control-plane   27s   v1.37.0
lab-worker          Ready    <none>          13s   v1.37.0
lab-worker2         Ready    <none>          13s   v1.37.0`}
</Terminal>

Three "machines", each of them really a Docker container. `docker ps` on your host will show them.

## Step 2: Deploy an Application

`hello.yaml` doesn't describe commands, it describes a wish: three copies of Nginx, and one stable address in front of them. Read it, then apply it:

<Terminal>
{`$ cat hello.yaml
$ kubectl apply -f hello.yaml
deployment.apps/hello created
service/hello created

$ kubectl rollout status deployment/hello
deployment "hello" successfully rolled out`}
</Terminal>

Is it answering? The `hello` Service distributes traffic to the copies, and any Pod in the cluster can reach it by name:

<Terminal wrap={true}>
{`$ kubectl run client --rm -i --image=busybox:1.37 --restart=Never -- wget -qO- http://hello | grep -o '<title>.*</title>'
<title>Welcome to nginx!</title>`}
</Terminal>

## Step 3: Break Something

Now do the demonstration at the top of the article. List the Pods, copy a name, and delete it:

<Terminal>
{`$ kubectl get pods
$ kubectl delete pod <one-of-the-names>
$ kubectl get pods`}
</Terminal>

The replacement appears at once, and the Service sends traffic only to Pods that are ready.

## Step 4: Scale in One Command

Your app is getting popular? Change one number. Kubernetes spreads the new copies across the nodes:

<Terminal>
{`$ kubectl scale deployment hello --replicas=6
deployment.apps/hello scaled

$ kubectl get pods -o wide --no-headers | awk '{print $7}' | sort | uniq -c
      3 lab-worker
      3 lab-worker2`}
</Terminal>

## Step 5: Survive a Bad Release

Here's the one that sells it to me. We deploy a version whose image doesn't exist, the kind of mistake that takes a site down on a Friday night:

<Terminal>
{`$ kubectl set image deployment/hello web=nginx:does-not-exist
deployment.apps/hello image updated

$ kubectl get pods
NAME                     READY   STATUS             RESTARTS   AGE
hello-5945bf4f6f-dzczq   1/1     Running            0          16s
hello-5945bf4f6f-jccrg   1/1     Running            0          16s
hello-5945bf4f6f-lh872   1/1     Running            0          17s
hello-5945bf4f6f-lvn52   1/1     Running            0          17s
hello-5945bf4f6f-nzlq9   1/1     Running            0          17s
hello-76b7987d8d-92gfs   0/1     ImagePullBackOff   0          15s
hello-76b7987d8d-ckx4v   0/1     ImagePullBackOff   0          15s
hello-76b7987d8d-wrjvz   0/1     ImagePullBackOff   0          15s`}
</Terminal>

Look closely: three new Pods are failing, but **five old ones are still serving your users**. The rollout stopped by itself instead of replacing everything. One command brings things back:

<Terminal>
{`$ kubectl rollout undo deployment/hello
deployment.apps/hello rolled back`}
</Terminal>

A rollout to an image that does exist follows the same logic in reverse: new Pods come up, old ones go away, little by little, and users don't notice. Try it with `nginx:1.30-alpine`.

## Step 6: Clean Up

Everything disappears, and your machine goes back to its previous state:

<Terminal>
{`$ lab-down
$ exit
$ docker network rm kind`}
</Terminal>

## Conclusion

At the beginning of this article, self-healing was only a word in a slide. You've now seen it: you describe what you want, and the cluster works continually to make it true, whether a container dies or a release goes wrong. To decide whether you actually need this for your own projects, <Link to="/blog/kubernetes-concepts">the companion article</Link> compares it with Docker Compose. And if you rebuild this lab one evening with your own image, in place of Nginx, you'll have learned more than from any slide deck.
