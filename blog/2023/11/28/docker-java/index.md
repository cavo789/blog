---
slug: docker-java
title: Play with Docker and Java
authors: [christophe]
image: ./images/social_media.jpg
tags: [docker, java]
enableComments: true
---
# Play with Docker and Java

![Play with Docker and Java](./images/header.jpg)

In this post, we'll play with Docker and Java. Since there are ready-to-use Java images for Docker you don't need to install or configure anything other than Docker.

:::note I don't know Java at all
You just need to know, I've absolutely no skills in Java. Which software should be installed, how to run a script and so on. I'll just rely on a very few Docker commands and, about the installation, yeah, using Docker, it's easy: nothing to install, nothing to configure.
:::

<!-- truncate -->

Please start a Linux shell and run `mkdir -p /tmp/java && cd $_` to create a folder called `java` in your Linux temporary folder and jump in it.

Please create a new file called `Main.java` with this content:

```java
public class Main
{
     public static void main(String[] args) {
        System.out.println("Hello, World");
    }
}
```

Now, you'll need to compile your source. For this, just run `docker run --rm -v $PWD:/app -w /app -u 1000:1000 openjdk:11 javac Main.java`.

This will download (just the first time) the `openjdk` Docker image then, the `javac` executable will be called to compile your `Main.java` source into `Main.class`.

By running `ls -alh` you can verify that, yes, the java script has been compiled into a `.java` file.

```bash
❯ ls -alh
total 24K
drwxr-xr-x  2 christophe christophe 4.0K Nov 22 15:02 .
drwxrwxrwt 29 root       root        12K Nov 22 14:58 ..
-rw-r--r--  1 christophe christophe  414 Nov 22 15:02 Main.class
-rw-r--r--  1 christophe christophe  117 Nov 22 14:58 Main.java
```

:::tip And without to have to install something
Once again, you don't have install or configure something; just call the Docker image *that goes well*.
::: 

Last thing is to execute your Java program. Now, please run `docker run --rm -v $PWD:/app -w /app openjdk:11 java Main` to execute it.

```bash
❯ docker run --rm -v $PWD:/app -w /app openjdk:11 java Main
Hello, World
```

## A little more difficult, calling a REST API

Please create a new file called `API.java` with this content:

```java
package restclient;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class API {
    public static void main(String[] args) {
        try {
            URL url = new URL("https://jsonplaceholder.typicode.com/todos/1");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            if (conn.getResponseCode() != 200) {
                throw new RuntimeException("Failed : HTTP Error code : "
                        + conn.getResponseCode());
            }

            InputStreamReader in = new InputStreamReader(conn.getInputStream());
            BufferedReader br = new BufferedReader(in);
            String output;

            while ((output = br.readLine()) != null) {
                System.out.println(output);
            }

            conn.disconnect();

        } catch (Exception e) {
            System.out.println("Exception in NetClientGet:- " + e);
        }
    }
}
```

Compile it by running `docker run --rm -v $PWD:/app -w /app -u 1000:1000 openjdk:11 javac API.java`; get the `API.class` file.

Finally, call `docker run --rm -v $PWD:/app -w /app openjdk:11 java API.java` to execute the API call and display the result on screen:

```bash
❯ docker run --rm -v $PWD:/app -w /app openjdk:11 java API.java
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*This example will use the sample `https://jsonplaceholder.typicode.com/todos/1` to generate one fake TODO. The JSON will be displayed on the command line.*

You're ready to start your Java's coding journey. Have fun.