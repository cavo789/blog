<!-- EBAUCHE -->

# Installation of Matomo

The self-hosting of Matomo is easy. There is a nice tutorial on [https://matomo.org/faq/on-premise/installing-matomo/](https://matomo.org/faq/on-premise/installing-matomo/).

What I did:

1. Create a subdomain `matomo.avonture.be` and pointing to a specific folder on my host.
2. I create too a SSL for my new sub-domain.
3. Connect on that new folder using SSH.
4. Run `wget https://builds.matomo.org/matomo.zip` then `unzip -o matomo.zip`
5. Since I know I should have a MySQL database, I surf to my dashboard. For PlanetHoster, it's [https://my.planethoster.com](https://my.planethoster.com) and there, I create a new MySQL db and his user.
6. I start the wizard on `https://matomo.avonture.be/index.php` and follow the guide.
7. 



When I get the Javascript tracking code, I just put in in a matomo.js script saved on my blog static folder.