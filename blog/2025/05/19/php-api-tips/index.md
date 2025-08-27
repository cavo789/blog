---
slug: php-api-tips
title: API REST - How to write good APIs
authors: [christophe]
image: /img/api_social_media.jpg
mainTag: api
tags: [api, docker, php, rest]
blueSkyRecordKey: 3lun2t72qus2r
---
![API REST - How to write good APIs](/img/api_banner.jpg)

<!-- cspell:ignore Belgif -->

<UpdateAt
  title="Recent Changes"
  updates={[
    { date: "2025-05-19", content: "Add belgif.be specifications" },
  ]}
/>

When developing APIs *from scratch*, you can do it in the mode *I get behind the PC and start programming* or *I learn about the standards first and then program in compliance with these standards*.

And if we lose sight of these norms, we quickly come back to writing endpoints like `/articles/insert` that are semantically incorrect (and even stupid). In fact, we'll never `GET` here.

The purpose of the article below is to list best practices by way of examples.

<!-- truncate -->

## Main concepts

### Uniform Resource Identifier

#### URI notation

*Path segments and query parameters should use lowerCamelCase notation to enhance readability and to separate compounds names.* ([reference](https://www.belgif.be/specification/rest/api-guide/#resource-uri))

| GOOD | BAD |
| --- | --- |
| <span style={{color: 'green'}}>`https://xxx/api/v1/ipsoLorem/331`</span>| <span style={{color: 'red'}}>`https://xxx/api/v1/Ipso_Lorem/331`</span> |
| | <span style={{color: 'red'}}>`https://xxx/api/v1/ipso-lorem/331`</span> |
| <span style={{color: 'green'}}>`https://xxx/api/v1/ipsoLorem/331`</span> | <span style={{color: 'red'}}>`https://xxx/api/v1/ipsoLorem/331/`</span> |
| <span style={{color: 'green'}}>`https://xxx/api/v1/ipsoLorem?country=BE`</span> | <span style={{color: 'red'}}>`https://xxx/api/v1/Ipso_Lorem?Country=BE`</span> |

URI shouldn't ends with a `/` and neither with a file extension so don't <span style={{color: 'red'}}>`https://xxx/api/v1/ipso-lorem/331.json`</span> but simply use HTTP headers like `Content-Type: application/json;charset=UTF-8` to inform it's a JSON answer.

#### Prefer plural noun

Always use the plural like `GET /api/v1/employees/1` to return the first employee and not `GET /api/v1/employee/1` ([reference](https://www.belgif.be/specification/rest/api-guide/#collection)).

Using the plural make it easier to understand that `employees` is a collection and we can use verbs like `GET` to get all, one or a range, `POST` to add a new employee, `PUT` to update a employee's information, ...

Also, using the plural form, the user will immediately understand he'll be able to add filters like `/1` to get, f.i. the employee #1.

##### Relations between collections

When building a URI think to the hierarchy and relationship between collections. If you need to return the list of tasks of John, you can use multiple notations like below illustrated:

| GOOD | BAD |
| --- | --- |
| <span style={{color: 'green'}}>`/api/v1/employees/john/tasks`</span>| <span style={{color: 'red'}}>`/api/v1/tasks/employees/john`</span> |

About the hierarchy: does *Tasks have employees* or *Employees have tasks*? This hierarchy clearly defined (an employee can have multiple tasks), put collections in that order in the URI so `/api/v1/employees/john` will return the employee and by adding `/tasks` we'll obtain his list of tasks (then we can filter to a specific one `/api/v1/employees/john/tasks/1` f.i.).

This makes URI more readable, intuitive and more scalable like in `/api/v1/employees/john/projects`.

#### Don't use verbs in URLs

HTTP has verbs like `GET`, `POST`, `DELETE`, ... so don't use calls like:

* `/api/v1/articles/gettitle`,
* `/api/v1/articles/insert`,
* `/api/v1/articles/1/delete`

But use the adequate HTTP verb:

* `GET /api/v1/articles/title`,
* `PUT /api/v1/articles`,
* `DELETE /api/v1/articles/1`

#### Send the HTTP Accept header

It's **really recommended** to inform the server about what you expect for: `json`, `csv`, `plain-text`, `xml`, ... To do this, use the `Accept` header like in the example here above. This is safer because the server can change his default format from JSON to CSV f.i. and if you expect JSON, your code will be broken.

Don't do this:

```js
const employee = axios.create({
    baseURL: 'https://xxx/api/v1/employees/123'
})
```

But well:

```js
const employee = axios.create({
    baseURL: 'https://xxx/api/v1/employees/123',
    headers: {
      'Accept': 'application/json'
    }
})
```

Now, in the second example, you tell the web server that you want a JSON representation and nothing else.

#### Filtering

Using `?` followed by a key=value pair like `?country=BE`. If you have several parameters, use `&` like in `?country=BE&lang=FR`.

If you need to provide multiple values for the same parameter, the standard is to repeat the parameter like in `/cars?color=black&color=blue` ([reference](https://www.belgif.be/specification/rest/api-guide/#rule-qry-multi)).

#### Sorting

One common practice is to use a key called `sort`, which can be used as many times as there are columns to filter. Descending sorting order can be indicated by prefixing the property name with the dash `-` sign ([reference](https://www.belgif.be/specification/rest/api-guide/#rule-col-sort)).

For instance `?sort=name&sort=-age` will make an ascending sort on the lastname column and a descending order on the age.

#### Pagination query parameters

When using pagination, `page` is used to determine the current page while `pageSize` the number of records to display.

So `/api/v1/employees?page=1&pageSize=5` will display the first five employees and `/api/v1/employees?page=2&pageSize=5` the following five.

#### Reserved query parameters name

([reference](https://www.belgif.be/specification/rest/api-guide/#query-parameters-2))

| Term | Description | Example | Ref |
| --- | --- | --- | --- |
| `page` | When a collection resources is paged, use this parameter to request a specific page. Page numbers are 1-based. | `?page=3&pageSize=20`| Pagination |
| `pageSize` | When a collection resources is paged, use this parameter to specify the page size. | `?page=3&pageSize=20` | Pagination |
| `q` | The standard search parameter to do a full-text search. | `?q=RESTFul` | Filtering |
| `select`| Filter the resource properties to the ones specified. | `?select=(name,address)` | Consult (Document) |
| `sort` | Multi-value query param with list of properties to sort on. Default sorting direction is ascending. To indicate descending direction, the property may be prefixed with -. |  `?sort=name&&sort=-age` | Collection |
| `embed` | Request to embed sub-resource. For instance `api/v1/countries` returns countries and `api/v1/countries?embed=political` countries with their political infos. This will prevent additional API calls. | `?embed=mainAddress` | Embedding resources |
| ``lang` | language to filter multi-language descriptions | `?lang=fr` | Multi-language descriptions |



### Verbs

#### HEAD

`HEAD` has to be used to retrieve information's about the resource like f.i. the number of records in the resource (number of books, articles, ...) or to check if a given resource exists. `HEAD` should be used to only retrieve the HTTP response headers of a resource ([reference](https://www.belgif.be/specification/rest/api-guide/#head)).

For instance, imagine a resource called `countries`, we can verify if `language=FR` will return something:

<Terminal>
$ curl --head https://xxx/api/v1/countries?language=FR
HTTP/2 200 OK
Content-Range: 0-5/*
Content-Location: /api/v1/countries?language=FR
Content-Type: application/json; charset=utf-8
</Terminal>

##### HEAD - Returned code

If we get a HTTP return code `200`, we can run a `GET` action to get records:

<Terminal>
$ curl https://xxx/api/v1/countries?language=FR | jq
</Terminal>

`HEAD` can thus be used to get meta data about a resource.

:::info How many countries have French as their official language?
In the returned headers of `HEAD` we will most probably get a `Content-Range` entry. In our fake example, we can determine that we've six countries where French is an official language.
:::


| Code | Status | Reason |
| --- | --- | --- |
| `200` | `OK` | The server has successfully processed the request. This means that the requested resource exists. |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to access to the requested resource. |
| `404` | `Not found` | The requested resource didn't exists |

The code `204 - No Content` isn't expected because even if `HEAD` didn't returns a response, the server well return HTTP headers and this is similar to a response. So, the standard code is to return `200`; not `204`.

##### Count number of items in a resource

> [https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range)

`HEAD` can be used against a resource to get the total number of records; f.i. to be able to use a navigation bar.

So, don't create an endpoint like `https://xxx/api/v1/countries/count` when the standard way is using `HEAD`.

Imagine a database table called `countries` having `984` records (i.e. the result of `SELECT Count(*) FROM countries;`).

This info can be retrieved from our API like this:

<Terminal>
$ curl --head https://xxx/api/v1/countries
HTTP/2 200 OK
Content-Range: 0-983/*
Content-Location: /api/v1/countries
Content-Type: application/json; charset=utf-8
</Terminal>

`curl --head` (similar to `curl -i`) is using the `HEAD` HTTP verb.

In order to extract this information in JavaScript, the [parse-content-range-header](https://github.com/academia-de-codigo/parse-content-range-header/blob/master/index.js) script can perhaps be used.

#### GET

:::tip You can translate `GET` as `READ` in `CRUD`
:::

Return a resource (can be a collection or just one).

Return all employees:

<Terminal>
$ curl -X GET -H "Accept: application/json" https://xxx/api/v1/employees
</Terminal>

Return the employee #1:

<Terminal>
$ curl -X GET -H "Accept: application/json" https://xxx/api/v1/employees/1
</Terminal>

`GET` is a strict read-only method, which should never modify the state of the resource ([reference](https://www.belgif.be/specification/rest/api-guide/#get)).

##### GET - Returned code

| Code | Status | Reason |
| --- | --- | --- |
| `200` | `OK` | The server has successfully processed the request. The requested resource exists and is returned to you. |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to access to the requested resource. |
| `404` | `Not found` | The requested resource didn't exists. |

The `204 - No content` code should not be used with `GET`.

#### POST

:::tip You can translate `POST` as `CREATE` in `CRUD`
:::

Using `POST` **you'll create a new resource**. Calling `POST` five times for the same "new" employee will thus create five new employees. <span style={{color: 'red'}}>`POST` is not idempotent meaning calling it more than once will return every time a new resource (like the new employee id).</span>

<Terminal>
$ {`curl -X POST -d '\{"firstname":"Christophe",...}' https://xxx/api/v1/employees`}
</Terminal>

:::note
When calling `POST` you should provide all the fields required to create the resource. So, for a new employee, his firstname, lastname, birthdate, national register number, his hiring date, the department where he'll work and so on.
:::

##### POST - Returned code

The example here above will create a new employee, the server will return the HTTP status code `201` (CREATED) and, probably, also return a location-header with a link, like `https://xxx/api/v1/employees/999` i.e. the link to the newly created employee.

| Code | Status | Reason |
| --- | --- | --- |
| `200`| `Created`| The resource has been successfully created. |
| `303` | `See Other` | The resource already exists and a link is provided to the resource. `303` is used to denote it's a normal check. |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to call this method. |
| `409` | `Conflict` | The resource can't be created (f.i. already exists). `409` is used when we didn't expect such use case. |

The `200 - OK` code should not be used with `POST`.

##### POST - Special case

`POST` can also be used when calling a controller like in `curl -X POST -d '{"action":"sendBirthdayMail",...}' https://xxx/api/v1/employees/123/actions` or `curl -X POST https://xxx/api/v1/employees/123/sendBirthdayMail`.

:::important The RESTful API standards recommends to use `POST` for actions.
So, we shouldn't do `GET https://xxx/api/v1/employees/actions` because `actions` it's not a resource but an action.
:::

#### PUT

:::tip You can translate `PUT` as `UPDATE` in `CRUD`, when you'll update every field
Using `PUT` implies you're intended to update each field of the record. If you plan to update just a few of them, take a look to the `PATCH` verb.
:::

Using `PUT` you'll update an existing resource. Let's imagine we have just three fields in our employees table:

<Terminal>
$ {`curl -X PUT -d '\{"firstname":"Christophe", "lastname":"AVONTURE", "national_number": 123456789}' https://xxx/api/v1/employees/999`}
</Terminal>

Consider using `PUT` only when **you'll update every information's** of the resource (except calculated fields like f.i. `employee_id`). If you wish to update just a few ones (partial content), Consider using `PATCH`.

<span style={{color: 'green'}}>`PUT` is idempotent since running the same update won't have other effects on the server. You can update once, five or one thousand times the firstname of the employee #999, the result will always be the same.</span>

##### PUT - Returned code

| Code | Status | Reason |
| --- | --- | --- |
| `200` | `OK` | The record was successfully updated and the updated version of the resource is returned. |
| `204` | `No Content` | The record was successfully updated and nothing is returned as HTTP response. |
| `400` | `Bad request` | The request is incorrect (f.i. you're trying to update a field `first_name` while his correct name is `firstname`). |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to call this method |
| `404` | `Not found` | The requested resource didn't exists (f.i. you tried to access `/api/v1/employees/1` and that one didn't exists). |

:::important
When getting `PUT -d '{"firstname":"Christophe"}' https://xxx/api/v1/employees/123456` the API developer can decide on his own to **CREATE** the resource 123456 if it didn't exists and if all required fields have been provided in the payload.

So, when the resource didn't exist, the developer can return a `404 - Not found` error or, if he decide to create the new resource, then the API could return `201 - Created` (just like a `POST`) ([reference](https://www.belgif.be/specification/rest/api-guide/#put)).
:::

#### PATCH

:::tip You can translate `PATCH` as `UPDATE` in `CRUD`, when you'll DON'T update every fields
If you plan to update all fields, you need to use `PUT`, not `PATCH`.
:::

`PATCH` is to be used when the update is partial like updating one field: `curl -X PATCH -d '{"firstname": "John"} https://xxx/api/v1/employees/999'` will, only, update first name.

`PATCH` on an in-existing resource will return an error while, perhaps, `PUT` will create the resource. If's then safer to use `PATCH` and not `PUT` when updating partial content.

It's indeed impossible to create a new record with `PATCH` since the request just mention a few information's, not all.

##### PATCH - Returned code

| Code | Status | Reason |
| --- | --- | --- |
| `200` | `OK` | The record was successfully updated and the updated version of the resource is returned. |
| `204` | `No Content` | The record was successfully updated and nothing is returned as HTTP response. |
| `400` | `Bad request` | The request is incorrect (f.i. you're trying to update a field `first_name` while his correct name is `firstname`). |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to call this method |
| `404` | `Not found` | The requested resource didn't exists (f.i. you tried to access `/api/v1/employees/1` and that one didn't exists). |

Note: like with `PUT` (see above), the developer can decide to create the resource. In that case `201 - Created` can be returned.

#### DELETE

:::tip You can translate `DELETE` as ... `DELETE` in `CRUD`
:::

To remove employee #59:

<Terminal>
$ curl -X DELETE https://xxx/api/v1/employees/59
</Terminal>

##### DELETE - Returned code

| Code | Status | Reason |
| --- | --- | --- |
| `200` | `OK` | The record was successfully deleted and a message like *The resource has been successfully deleted* is returned. |
| `204` | `No Content` | The record was successfully deleted and nothing is returned as HTTP response. |
| `400` | `Bad request` | The syntax of the request is invalid. |
| `401`| `Unauthorized` | The endpoint is secured and the request didn't pass a valid access token. |
| `403` | `Access denied` | You're not allowed to call this method. |
| `404` | `Not found` | The requested resource didn't exists (f.i. you tried to access `/api/v1/employees/1` and that one didn't exists). |
| `409` | `Conflict` | The resource can't be deleted (f.i. you can't dismiss an employee while there are still payments to be mode). |

#### OPTIONS

`OPTIONS` can be used to retrieve the list of actions we can do with a resource like f.i. `curl -X OPTIONS https://xxx/api/v1/employees/1` and we can expect to get `GET` (we can get the employee 1 metadata), `PATCH/PUT` (we can update it), ... but we'll not retrieve `POST` since that employee already exists ([reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/OPTIONS)).

### Responses

#### Status codes

##### 200 OK

A server MUST respond to a successful request to fetch an individual resource or resource collection with a `200 OK` response.

When `DELETE` was used, we can also return `204 No Content` to inform the calling application that deletion was successful.

##### 201 Created

If the requested resource has been created successfully and the server changes the resource in any way (for example, by assigning an id), the server MUST return a `201 Created` response and the new added resource in body.

##### 202 Accepted

If a request to create/update or delete a resource has been accepted for processing, but the processing has not been completed by the time the server responds, the server MUST return a `202 Accepted` status code.

##### 204 No Content

If the requested resource has been created successfully and the server does not change the resource in any way (for example, by assigning an id or `createdAt` attribute), the server MUST return either a `201 Created` status code and the resource in response or a `204 No Content` status code with no response document.

If the deletion was done successfully, `204 No Content` can be used too.

For an update, it's the same: we can send code `200 OK` with the updated resource in the body or, code `204 No Content` without body; just headers.

##### 400 Not Found

You should return a `400 Bad Request` response when the call was incorrect like an unknown value is used for a parameter (like `&lang=it` when Italian isn't supported).

##### 401 Unauthorized

The requested API is a secured one and a call to it has been made without a valid access token.

##### 403 Forbidden

A server MUST return `403 Forbidden` in response to an unsupported request to, for instance, create a resource (with `POST` verb with a client-generated `ID` since the `ID` has to be generated by the server, not the client).

The error `403 Forbidden` has to be used too when a valid token is used but when the called resources requires a specific scope (like `canManageCustomers`) and the used token don't have that one.

##### 404 Not Found

A server MUST respond with `404 Not Found` when processing a request to fetch a single resource that does not exist, except when the request warrants a 200 OK response with null as the primary data (as described above).

##### 406 Not Acceptable

The request is asking for f.i. `application/xml` but the API didn't support it. In this case, the code `406 - Not Acceptable` has to be returned ([reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/406)).

The request is well valid (the structure is correct) but the asked return type is not supported. For instance, by updating `application/xml` to `application/json` then the request can be processed.

The error is about the response's format; not about the request.

##### 409 Conflict

A server MUST return `409 Conflict` when processing a `POST` request to create a resource with a client-generated `ID` that already exists.

A server MUST return `409 Conflict` when processing a `POST` request in which the resource object's type is not among the type(s) that constitute the collection represented by the endpoint.

##### 415 Unsupported Media Type

Like `406 Not Acceptable`, the server can't process the request but here, it's because the server didn't know how to process the received information ([reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/415)).

As an example, if the request is a POST with a JSON payload like `curl -X POST -d '{"firstname":"Christophe",...}' https://xxx/api/v1/employees`, the server can return the code `415 - Unsupported Media Type` when the server was expecting a XML payload; not a JSON one.

The response would contain the supported type so, f.i.,

<Terminal>
$ curl -X POST -H "Content-Type: application/x-www-form-urlencoded" https://xxx/api/v1/employees [...]
HTTP/2 415 Unsupported Media Type
Accept-Post: application/json; charset=UTF-8
Content-Length: 0
</Terminal>

In this example, the server didn't support `application/x-www-form-urlencoded` for that route but will `application/json`.

#### Media Types

The requestor application should specify the media type(s) that is(are) acceptable using the `Accept` HTTP header.

A REST response or request with payload must include the `Content-Type` HTTP header to indicate the media type of the HTTP payload.

For example, the request has to define `-H "Accept: application/json"` in his header to let the server to know which media type is needed and the server (the response) should provide the `Content-Type` too.

<Terminal>
$ curl -X -H "Accept: application/json" GET https://xxx/api/v1/employees
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
</Terminal>

If returning JSON is not managed by the API, the server has to return the HTTP code `406 - Not Acceptable`.

#### The returned answer

All RESTful APIs must support JSON and it's the default representation to use (i.e. when no `Content-Type` header is sent with the request).

Following guidelines SHOULD be respected when determining a name for a JSON property ([reference](https://www.belgif.be/specification/rest/api-guide/#json-2)):

* use lowerCamelCase notation,
* also for abbreviations: all letters after the first should be lowercase,
* use American English,
* do not use underscores (_), hyphens (-) or dots (.) in a property name, nor use a digit as first letter,
* the name should refer to the business meaning of its value in relation to the object in which it is specified, rather than how it is defined and
* omit parts of the name that are already clear from the context.

Properties used from other standards, like OpenID Connect and OAuth2, are allowed to deviate from this rule.

##### Handling null values

When a property is set to null, that property shouldn't be sent.  For instance

```json
{
  "name": "CompanyName",
  "country": "Belgium",
  "employerId": null
}
```

In this case, the `employerId` key can be omitted.

##### Don't return an array for the answer

See also the next chapter.

In order to make the API flexible, make sure the answer is a JSON object `{ ... }` and not an array `[ ... ]` because that last one won't allow to add extra properties in the future ([reference](https://www.belgif.be/specification/rest/api-guide/#rule-evo-object)).

##### Top-Level

> [https://jsonapi.org/format/#document-top-level](https://jsonapi.org/format/#document-top-level)

A document MUST contain at least one of the following top-level members:

* `data`: the document's *primary data*. This node has to be renamed to better describe the object, f.i. `employees` or `countries`, ...
* `errors`: an array of error objects.
* `meta`: a meta object that contains non-standard meta-information.

:::caution Never return both `data` and `errors`
If the query has generated an error, it is not expected to return any data. And vice versa.
:::

The document's *primary data* is a representation of the resource or collection of resources targeted by a request.

`data` can be an array or not:

```json
{
  "data": {
    [
        "key1": "value1",
        "key2": "value2",
        // ...
    ],
    [
        // ...
    ]
  }
}
```

or, if just one record, directly:

```json
{
  "data": {
    "key1": "value1",
    "key2": "value2",
    // ...
  }
}
```

:::tip Most of the time, it's the developer choice for an array
In fact, most of the time, an array is returned, as this allows the API to be modified in the future to return other results without generating BC (break changes) in the API.
:::

##### Data

> [https://jsonapi.org/format/#document-top-level](https://jsonapi.org/format/#document-top-level)

As described in [Top-Level items](https://jsonapi.org/format/#document-top-level), the returned information should be put as a top-level node called `data`:

Best is to always use the array notation so we can return one or more rows.

```json
'data': [
    [...]
]
```

##### Returning an error

> [https://jsonapi.org/format/#document-top-level](https://jsonapi.org/format/#document-top-level)
>
> [https://jsonapi.org/format/#error-objects](https://jsonapi.org/format/#error-objects)

As described in [Top-Level items](https://jsonapi.org/format/#document-top-level), errors should be put as a top-level node and use the plural form:

```json
"errors": [
    [...]
]
```

Prefer to use HTTP status code `400 Bad Request` when the call was incorrect like an unknown value is used for a parameter (like `&lang=it` when Italian isn't supported). Use code `500 Internal Server Error` when the server has returned an error.

`errors` has to be an array so we can return more than once and should contain at least one of these keys (*not exhaustive*):

* `status`: the HTTP status code applicable to this problem, expressed as a string value. This SHOULD be provided.
* `code`: an application-specific error code, expressed as a string value.
* `title`: a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
* `parameter`: a string indicating which URI query parameter caused the error.

```json
"errors": [
    [
        "status": 400,
        "code": "ERR_INVALID_VIEW",
        "title": "Language code 'it' is not supported",
        "parameter": "lang"
    ],
    [...]
]
```

#### The response of a paginated page

When using pagination, the JSON answer of `GET https://xxx/api/v1/employees?page=2&pageSize=2` can be something like this ([reference](https://www.belgif.be/specification/rest/api-guide/#rule-col-paging)):

```json
{
  "self": "/api/v1/employees?page=2&pageSize=2",
  "data": [
    {
      "href": "/api/v1/employees/3",
      "id": 3,
      "firstname": "John",
      "lastname": "Doe",
    },
    {
      "href": "/api/v1/employees/4",
      "id": 4,
      "firstname": "Jane",
      "lastname": "Doe",
    }
  ],
  "pageSize": 2,
  "page": 2,
  "total": 7,
  "first": "/api/v1/employees?pageSize=2",
  "last": "/api/v1/employees?page=4&pageSize=2",
  "prev": "/api/v1/employees?page=1&pageSize=2",
  "next": "/api/v1/employees?page=3&pageSize=2"
}
```

| Key | Description |
| --- | --- |
| `next` | MANDATORY (except for the last page) hyperlink to the next page |
| `prev` | OPTIONAL hyperlink to the previous page |
| `pageSize` | RECOMMENDED Maximum number of items per page. For the last page, its value should be independent of the number of actually returned items. |
| `page` | MANDATORY (offset-based); N/A (cursor-based) Index of the current page of items, should be 1-based (the default and first page is 1) |
| `first` | OPTIONAL Hyperlink to the first page |
| `last` | OPTIONAL Hyperlink to the last page |
| `total` | OPTIONAL Total number of items across all pages. If query parameters are used to filter the result set, this is the total of the collection result set, not of the entire collection. |

### Expected endpoints

Each REST API should expose a `GET /api/v1/health` endpoint which returns the availability of the API's functionality.

| Status | Status Code | Description |
| --- | --- | --- |
| `UP` | `200` | The API is functioning as expected. |
| `DEGRADED` | `200` | The API is partly unavailable but service can be continued with reduced functionality. |
| `DOWN` | `503` | The API is suffering unexpected failures. |

## Some lectures

* [7 Laravel RESTful APIs best practices for 2023](https://benjamincrozat.com/laravel-restful-api-best-practices)
* [Belgif - REST Guidelines](https://www.belgif.be/specification/rest/api-guide)
