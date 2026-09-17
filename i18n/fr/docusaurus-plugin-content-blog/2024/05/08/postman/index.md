---
slug: postman
title: Utiliser Postman pour jouer avec les API
date: 2024-05-08
description: Maîtrisez les tests d'API avec Postman. Utilisez-le comme un véritable outil de tests unitaires pour valider le statut des réponses, imposer une structure de données et éviter les régressions dans votre workflow de développement d'API.
authors: [christophe]
image: /img/v2/api.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - code-quality
  - php
  - tests
language: fr
review_date: 2026-07-30
---
<!-- cSpell:ignore ELECTRABEL,taxud -->
![Utiliser Postman pour jouer avec les API](/img/v2/api.webp)

<TLDR>
Cet article montre comment utiliser Postman comme outil de tests unitaires pour les API : mise en place des environnements et des collections avec des assertions partagées, puis écriture de contrôles `pm.test()` pour les codes de statut, le temps de réponse, les en-têtes content-type et — avec, comme fil rouge, un service SOAP de validation de numéro de TVA — des assertions poussées sur la structure XML/JSON : nœuds, collections et valeurs précises.
</TLDR>

Si vous développez votre propre API (peu importe le langage — <Link to="/blog/python-fastapi">Python FastAPI</Link> prend environ une minute) ou si vous devez en consommer une, [Postman](https://www.postman.com/) peut se révéler très pratique.

*Postman exige un compte et stocke vos collections dans son cloud. Pour une alternative 100 % locale et compatible avec Git, voyez <Link to="/blog/bruno">Bruno - A postman-like tool - GUI and CLI</Link>.*

Appeler une API et récupérer la réponse, c'est une chose, et c'est même assez simple. Mais une fonctionnalité sympa de Postman est la possibilité de valider la réponse : s'assurer que le type retourné est par exemple `application/json`, que le code de statut HTTP est 200, que le corps de la réponse est un objet JSON (ou une chaîne XML), que ce corps contient certaines informations obligatoires, et ainsi de suite.

Vous pouvez aussi valider la réponse par rapport à un schéma donné pour vérifier que la structure est bien celle attendue.

Dans cet article, nous allons utiliser Postman comme un outil de tests unitaires, c'est-à-dire lancer des contrôles sur notre propre API et faire un maximum d'assertions. Cela améliore la qualité de votre code en mettant en évidence les erreurs potentielles et, pour tout refactoring futur, relancer les tests vous garantira que vous n'avez rien cassé ; que vous n'avez aucune régression. Être sûr de ne pas avoir cassé une API quand vous mettez du code à jour, ça vaut de l'or.

<!-- truncate -->

Vous pouvez télécharger Postman gratuitement ici : [https://www.postman.com/](https://www.postman.com/). Il faudra créer un compte avant de pouvoir télécharger le programme. La documentation se trouve sur [https://learning.postman.com/docs/introduction/overview/](https://learning.postman.com/docs/introduction/overview/) ; cet article n'expliquera donc pas en détail comment utiliser le programme mais donnera simplement quelques astuces.

## Créer un environnement {#creating-an-environment}

Créer un environnement, c'est comme créer des variables globales.

![Créer un environnement](./images/creating_environment.webp)

Dans l'exemple ci-dessus, je définis mon `base_url` avec l'URL de mon web service.

Pensez bien à activer l'environnement (voir le point 2 sur l'image).

Dès à présent, je peux donc créer une requête et utiliser `{{base_url}}`

![Utiliser l'URL de base](./images/using_base_url.webp)

## Créer une collection {#creating-a-collection}

Si vous devez créer plus d'une requête, mieux vaut créer une collection (comprenez *un projet*). Vous pourrez y stocker toutes vos requêtes, mais le plus gros avantage est de pouvoir définir des règles par défaut comme, par exemple, des tests à lancer pour chaque requête :

![Collection avec des tests globaux](./images/collection_tests.webp)

Ainsi, quelle que soit la requête que je lance, les quatre tests ci-dessous seront toujours exécutés :

```php
pm.test("response is ok", function () {
    pm.response.to.have.status(200);
});

pm.test("Content-Type header is present", () => {
  pm.response.to.have.header("Content-Type");
});

pm.test("Content-Type header is text/xml", () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('text/xml; charset=utf-8');
});

pm.test("Don't contain any error", function ()
{
    pm.expect(pm.response.text()).to.not.include("error");
});
```

## Créer une requête {#creating-a-request}

En créant une nouvelle requête, pour passer des informations dans l'en-tête, il me suffit de cliquer sur l'onglet `Headers` puis de renseigner la clé que je souhaite envoyer. Dans l'exemple d'une requête SOAP (c'est-à-dire appelée avec une *enveloppe XML*), je devrai envoyer une clé `SOAPAction` avec le nom de l'action à lancer (`testFlag` ici) et je préciserai que le corps envoyé est de type `application/xml`.

![Les en-têtes de la requête](./images/request_headers.webp)

Ensuite, puisque cet exemple concerne une requête SOAP, je dois envoyer un corps XML, tel qu'attendu par l'action :

![Le corps de la requête](./images/request_body.webp)

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="{{wsdl}}">
    <soapenv:Header />
    <soapenv:Body>
        <ns1:testFlagInput />
    </soapenv:Body>
</soapenv:Envelope>
```

Le placeholder `{{wsdl}}` est une variable définie dans l'environnement.

Et, en option, nous pouvons aussi ajouter un test spécifique à la requête :

![Les tests de la requête](./images/request_tests.webp)

```php
pm.test("status OK", function () {
    var jsonObject = xml2Json(responseBody);
    var status = jsonObject["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:testFlagOutput"]["status"];
    return status == "OK"
});
```

<AlertBox variant="note" title="Remplacez `testFlag` par le nom de votre nœud" />

En lançant la requête, dans cet exemple, nous exécuterons cinq tests puisque nous avons déjà défini quatre tests pour la collection.

![Résultat de la requête - Tests](./images/request_results_tests.webp)

## Exporter / importer une collection {#exporting--importing-a-collection}

En regroupant toutes vos requêtes dans une collection, vous pouvez facilement l'exporter (sous forme de fichier `.json`)

![Exporter une collection](./images/exporting_collection.webp)

Et, bien sûr, l'importer presque de la même manière :

![Importer une collection](./images/importing_collection.webp)

## Exemple concret {#real-world-example}

Comme vu dans l'article <Link to="/blog/vba-excel-call-soap-webservice">MS Excel - How to call a SOAP web service</Link>, nous pouvons appeler un web service européen pour vérifier la validité d'un numéro de TVA.

Essayons avec Postman :

L'URL de base du service est `http://ec.europa.eu/taxation_customs/vies/services/checkVatService`, la méthode doit être `POST` et nous devons définir l'en-tête `SOAPAction` à `checkVAT`.

![En-têtes du service Check VAT](./images/checkVatService_request_headers.webp)

Ensuite, nous devons envoyer un corps XML spécifique. Pour l'exemple, nous allons interroger un numéro de TVA en Belgique.

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <urn:checkVat xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <urn:countryCode>BE</urn:countryCode>
            <urn:vatNumber>0403170701</urn:vatNumber>
        </urn:checkVat>
    </soapenv:Body>
</soapenv:Envelope>
```

![Corps de la requête du service Check VAT](./images/checkVatService_request_body.webp)

En lançant la requête, Postman renvoie :

```xml
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
    <env:Header/>
    <env:Body>
        <ns1:checkVatResponse xmlns:ns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <ns1:countryCode>BE</ns1:countryCode>
            <ns1:vatNumber>0403170701</ns1:vatNumber>
            <ns1:requestDate>2024-03-05+01:00</ns1:requestDate>
            <ns1:valid>true</ns1:valid>
            <ns1:name>SA ELECTRABEL</ns1:name>
            <ns1:address>Boulevard Simon Bolivar 36 1000 Bruxelles</ns1:address>
        </ns1:checkVatResponse>
    </env:Body>
</env:Envelope>
```

![Réponse du service Check VAT](./images/checkVatService_request_response.webp)

## Quelques contrôles {#some-checks}

<AlertBox variant="info" title="J'utilise `{{wsdl}}` comme placeholder">
Dans les exemples ci-dessous, vous verrez `{{wsdl}}` dans les extraits de code XML. Ce n'est qu'un placeholder : en situation normale, vous y retrouverez une URL vers un service WSDL (ou une API REST).

</AlertBox>

### Contrôler des métriques comme le responseTime {#check-some-metrics-like-the-responsetime}

Si vous souhaitez valider le temps de réponse d'une requête, par exemple 500 ms :

```php
pm.test('Response time is within an acceptable range', function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
})
```

### Contrôler le code de statut HTTP {#controls-the-http-status-code}

Valider que le code de statut de la réponse est `200` :

```php
pm.test('Response status code is 200', function () {
    pm.expect(pm.response.code).to.equal(200);
})
```

### S'assurer que la réponse renvoie un content-type {#ensure-the-response-returns-a-content-type}

```php
pm.test("Content-Type header is present", () => {
  pm.response.to.have.header("Content-Type");
});
```

Et si nous voulons vérifier la valeur du content-type retourné :

```php
pm.test("Content-Type header is text/xml", () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('text/xml; charset=utf-8');
});
```

### Vérifier que la réponse est une chaîne XML valide {#assert-the-response-is-a-valid-xml-string}

Test simple pour s'assurer que nous avons bien reçu une réponse XML valide :

```php
pm.test('Response body is in valid XML format', function () {
    const responseData = pm.response.text();
    try {
        xml2Json(responseData);
        pm.expect(true).to.be.true;
    } catch (error) {
        pm.expect.fail('Response body is not in valid XML format');
    }
})
```

### Valider l'absence ou la présence de certains mots {#validate-the-absence-or-presence-of-some-words}

Analyser la réponse **comme une chaîne** et s'assurer que le mot *error* n'est pas présent :

```php
pm.test("Don't contain any error", function ()
{
    pm.expect(pm.response.text()).to.not.include("error");
});
```

Cet exemple échouera donc dès que le mot *error* apparaît dans la réponse retournée.

Ou, à l'inverse, s'assurer que certains mots sont bien présents dans la réponse :

```php
pm.test("Assert 'is successful'", function ()
{
    pm.expect(pm.response.text()).to.include("is successful");
});
```

### Faire des assertions sur l'absence de nœuds {#make-assertions-on-the-absence-of-nodes}

Cette assertion est plus spécifique. Elle échouera dès qu'un nœud `<error>` est présent dans la réponse.

```php
pm.test("The error node shouldn't be part of the response", function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:testOutput']['error']).to.not.exist;
})
```

Si votre réponse est celle ci-dessous, l'assertion échouera puisque `<ns1:testOutput>` contient un nœud `<error>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="{{wsdl}}">
    <SOAP-ENV:Body>
        <ns1:testOutput>
            <error>
                <!-- ... -->
            </error>
        </ns1:...>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

### Faire des assertions sur la présence de nœuds {#make-assertions-on-the-presence-of-nodes}

À titre d'exemple, nous allons nous assurer que la réponse contient toujours `<SOAP-ENV:Envelope>` et `<SOAP-ENV:Body>` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="{{wsdl}}">
    <SOAP-ENV:Body>
        <!-- ... -->
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

```php
pm.test('Validate SOAP-ENV:Envelope and SOAP-ENV:Body elements are present', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData).to.have.property('SOAP-ENV:Envelope');
    pm.expect(responseData['SOAP-ENV:Envelope']).to.exist;
    pm.expect(responseData['SOAP-ENV:Envelope']).to.have.property('SOAP-ENV:Body');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']).to.exist;
})
```

<AlertBox variant="note" title="`to.exist` est équivalent à `to.have.property`"/>

`pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']).to.exist` peut aussi s'écrire comme ceci : `pm.expect(responseData['SOAP-ENV:Envelope']).to.have.property('SOAP-ENV:Body');`

### Pour du XML, vérifier la valeur d'un nœud donné {#for-xml-check-the-value-of-a-given-node}

Si vous souhaitez vous assurer qu'un nœud donné possède une propriété spécifique :

```php
pm.test('Response body has the required fields', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.have.property('SOAP-ENV:Envelope');
    pm.expect(responseData['SOAP-ENV:Envelope']).to.have.property('SOAP-ENV:Body');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']).to.have.property('ns1:testFlag');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:testFlag']).to.have.property('count');
    pm.expect(responseData['SOAP-ENV:Body']['ns1:getSessionsLanguagesOutput'].list).to.exist;
})
```

#### Assertions sur les collections {#assertions-for-collections}

Imaginons que votre réponse retourne une collection comme, ci-dessous, une liste de langues :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="{{wsdl}}">
    <SOAP-ENV:Body>
        <ns1:getLanguagesOutput>
            <list>
                <description>English</description>
                <iso>en</iso>
                <language>E</language>
            </list>
            <list>
                <description>Français</description>
                <iso>fr</iso>
                <language>F</language>
            </list>
            <list>
                <description>Nederlands</description>
                <iso>nl</iso>
                <language>N</language>
            </list>
        </ns1:getLanguagesOutput>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

Assurez-vous que le nœud list existe :

```php
pm.test('List array contains at least one element', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']).to.have.property('list');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']['list']).to.exist;
})
```

Vous voulez vous assurer qu'il y a au moins un enregistrement :

```php
pm.test('List array contains at least one element', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput'].list).to.be.an('array').and.to.have.lengthOf.at.least(1);
})
```

Vérifier que chaque élément de la liste contient bien les nœuds attendus ; par exemple :

```php
pm.test('Validate expected structure', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']).to.have.property('list');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput'].list).to.be.an('array').and.to.have.lengthOf.at.least(1);

    responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']['list'].forEach(function (node) {
        pm.expect(node.description).to.exist.and.to.not.be.empty;
        pm.expect(node.iso).to.exist.and.to.not.be.empty;
        pm.expect(node.language).to.exist.and.to.not.be.empty;
    });
})
```

Quand le `<list></list>` ne contient qu'un seul élément (et donc pas un tableau) :

```php
pm.test('Validate expected structure', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']).to.have.property('list');

    const list = responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getLanguagesOutput']['list']
    pm.expect(list).to.have.property('description').and.to.not.be.empty;;
    pm.expect(list).to.have.property('iso').and.to.not.be.empty;;
    pm.expect(list).to.have.property('language').and.to.not.be.empty;;
})
```

#### Assertions sur les valeurs {#assertions-on-value}

##### Vérifier la valeur {#check-on-the-value}

Imaginez que vous ayez quelque chose comme ceci et que vous vouliez vérifier que le statut est `OK` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="{{wsdl}}">
    <SOAP-ENV:Body>
        <ns1:testFlagOutput>
            <status>OK</status>
        </ns1:testFlagOutput>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

```php
pm.test("status OK", function () {
    var jsonObject = xml2Json(responseBody);
    var status = jsonObject["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:testFlagOutput"]["status"];
    return status == "OK"
});
```

Même idée, mais nous allons nous assurer que la propriété `count` est correctement définie, c'est-à-dire avec un nombre.

```php
pm.test("Returned count is a number", function () {
    var jsonObject = xml2Json(responseBody);
    var count = jsonObject["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:testFlagOutput"]["count"];
    pm.expect(Number.isInteger(count));
});
```

Si vous avez un nœud error dans votre réponse, assurez-vous que la propriété du code d'erreur n'est pas vide :

```php
pm.test('Error code is not empty', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:testFlag'].error.code).to.exist.and.to.not.be.empty;
})
```

Et si vous avez aussi une propriété contenant le message d'erreur, vérifiez qu'elle n'est pas vide mais contient bien une description de l'erreur.

```php
pm.test('Error message is not empty', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:testFlag']['error']['message']).to.exist.and.to.not.be.empty;
})
```

##### Contrôles sur une valeur de type date {#checks-on-date-value}

Vous avez une liste d'employés dans une collection et vous souhaitez vérifier le birthDate :

```php
pm.test('Validate birthDate is null or in a valid date format', function () {
    const responseData = xml2Json(pm.response.text());
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:getEmployeesOutput']['list']['birthDate']).to.satisfy(function (date) {
        return date === null || new Date(date).toString() !== 'Invalid Date';
    });
})
```
