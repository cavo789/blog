---
slug: cypress
title: Introduction to Cypress
authors: [christophe]
image: /img/functional_testing_social_media.jpg
tags: [chrome, cypress, docker, javascript, node, tests]
enableComments: true
---
![Introduction to Cypress](/img/functional_testing_banner.jpg)

In june 2024, I've written an article about a PHP functional test tool called [Behat](/blog/behat-introduction), let's see how to proceed with Cypress which is a Javascript tool.

Create a temporary directory like `mkdir /tmp/cypress && cd $_`

Create the `package.json` file with the following content. The objective is to mention we need the `cypress` dependency and we'll define to commands, `open` and `run`.

<details>
<summary>package.json</summary>

```json
{
    "name": "cypress_sandbox",
    "version": "1.0.0",
    "description": "Playing with cypress",
    "scripts": {
      "cypress:open": "cypress open",
      "cypress:run": "cypress run"
    },
    "devDependencies": {
      "cypress": "^12.17.4"
    }
}
```

</details>

We also need a configuration file and that one has to be called `cypress.config.js`. Create that file with the content below.

In short, we'll define the URL to our local cypress engine to `http://localhost:3100`, we'll inform override the default port `3000` to `3100` and we'll specify we don't use a cypress support configuration file.

<details>
<summary>cypress.config.js</summary>

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3100', // Update baseUrl to match the port
    port: 3100, // Explicitly set the port
    supportFile: false,
  },
});
```

</details>


Let's create a very stupid first test: we'll visit my blog and check that, somewhere, my full name appears:

<details>
<summary>cypress/e2e/example.cy.js</summary>

```javascript
describe('Testing my blog', () => {
    it('Check my last name is somewhere', () => {
      cy.visit('https://www.avonture.be')
      cy.contains('Christophe Avonture')
    })
})
```

</details>

An optional file to create is `.dockerignore`, it will tell Docker to not copy some files in our Docker image. In our tutorial here we don't really need it but it's always a good idea to have such file as a reminder to not forget that Docker can skip files with copying files and directories when building an image.

<details>
<summary>.dockerignore</summary>

```text
node_modules
Dockerfile
.dockerignore
```

</details>

Finally, last file to create, we'll create our own Docker image:

<details>
<summary>Dockerfile</summary>

```Dockerfile
FROM cypress/included:14.2.0

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node cypress/ ./cypress/
COPY --chown=node:node cypress.config.js ./

RUN npx cypress verify

USER node

CMD ["npx", "cypress", "run", "--browser", "chrome"]
```

</details>

![Our cypress project in VSCode](./images/vscode.png)

To create our image and run cypress, just run this command: `docker build -t cypress-test . && docker run --rm cypress-test`.

If everything is running fine, you'll get this output:

![First run](./images/first_run.png)

Nice, let's add a new test: we want to go to the homepage then click on the **Tags** menu navigation item. We expect then that the URL of the new page will contain `/tags` and, too, we expect the new page HTML content will have a `h1` element with the word `Tags`:

<details>
<summary>cypress/e2e/navigation.cy.js</summary>

```javascript
describe('Navigation Test', () => {
    it('should navigate to the tags page', () => {
      cy.visit('https://www.avonture.be');
  
      // Find the "TAGS" link and click it. Adjust the selector if needed.
      cy.contains('a', 'Tags').click();
  
      // Assert that the URL includes '/tags'.
      cy.url().should('include', '/tags');
  
      // Optional: Add more assertions to verify the content of the tags page.
      cy.get('h1').should('contain', 'Tags'); // Example assertion, adjust based on the page's content.
    });
});
```

</details>

Simply run `docker build -t cypress-test . && docker run --rm cypress-test` again to recreate the Docker image and run it.

![Navigation](./images/navigation.png)

The idea of this tutorial is to keep things simple, so we won't go any further here. 

However, don't forget that you can mount a folder with the `-v` flag. Instead of rebuilding the Docker image everytime, you can just run `docker run --rm cypress-test -v ./cypress:/app/cypress`. This will mount (share if you prefer) your current `cypress` folder from your host into the Docker container. 

So, if on  your host, you update the `cypress/e2e/navigation.cy.js` file to f.i. `cy.get('h1').should('contain', 'List of tags');`, the change will be made immediately in the container. Just run `docker run --rm cypress-test -v ./cypress:/app/cypress` again (no `docker build` needed) to run the updated version (which will fail in this case).