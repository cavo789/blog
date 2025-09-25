---
date: 2023-12-13
slug: linux-jq
title: The jq utility for Linux
authors: [christophe]
image: /img/v2/json.webp
mainTag: linux
tags: [bash, json, jq, linux, tips]
---
<!-- cspell:ignore Salomé -->
![The jq utility for Linux](/img/v2/json.webp)

`jq` is a powerful utility for Linux allowing manipulating JSON data from the command line and can be integrated into shell scripts.

Using `jq` you can beautify JSON output but also filter it like f.i. showing only a given node.

<!-- truncate -->

To verify if `jq` is already installed on your system, simply run `which jq`. If you get `jq not found` as an answer, please install it: `sudo apt-get update && sudo apt-get install jq`

## Let's play

`jq` can be used without any arguments and in that case, the JSON output will be prettified.

To illustrate this, we'll use a simple JSON free API like `https://randomuser.me/api/`. If you wish to use another API tool, take a look on [https://github.com/public-apis/public-apis#test-data](https://github.com/public-apis/public-apis#test-data); free ones are those having `No` in the `Auth` columns.

:::info randomuser API return every time a new user
On each request, the `randomuser` API is returning a new object.
:::

By running `curl https://randomuser.me/api/` you'll get something like

<Terminal>
$ curl https://randomuser.me/api/
</Terminal>

<!-- cspell:disable -->
```json
{"results":[{"gender":"female","name":{"title":"Mademoiselle","first":"Milena","last":"Martin"},"location":{"street":{"number":9831,"name":"Rue de L'Abbé-Migne"},"city":"Lengnau (Ag)","state":"Basel-Landschaft","country":"Switzerland","postcode":3789,"coordinates":{"latitude":"-60.0739","longitude":"135.1462"},"timezone":{"offset":"+7:00","description":"Bangkok, Hanoi, Jakarta"}},"email":"milena.martin@example.com","login":{"uuid":"bafdf972-4183-484a-903a-84f2654f0fec","username":"purpleleopard344","password":"cameron","salt":"gGoFrP1a","md5":"af359ca6697c3ac68f4c190583544619","sha1":"19033bc1630d96bba29726823ef91f53800e67d1","sha256":"cac6a35f5135f14707b8b3ec48617f23b4105b1c5e33a2b64597e7a0c7c891a0"},"dob":{"date":"1998-10-10T02:42:04.525Z","age":25},"registered":{"date":"2005-05-01T01:26:36.354Z","age":18},"phone":"079 098 73 86","cell":"077 411 83 18","id":{"name":"AVS","value":"756.9632.2579.59"},"picture":{"large":"https://randomuser.me/api/portraits/women/37.jpg","medium":"https://randomuser.me/api/portraits/med/women/37.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/37.jpg"},"nat":"CH"}],"info":{"seed":"213f93e3e854d33c","results":1,"page":1,"version":"1.4"}}
```
<!-- cspell:enable -->

The JSON is just echoed on the screen, not really readable.

But, as soon as we are redirecting to `jq`, it'll be better:

<Terminal>
$ curl --silent https://randomuser.me/api/ | jq
</Terminal>

<!-- cspell:disable -->
```json
{
  "results": [
    {
      "gender": "female",
      "name": {
        "title": "Mademoiselle",
        "first": "Salomé",
        "last": "Roy"
      },
      "location": {
        "street": {
          "number": 2361,
          "name": "Rue Dumenge"
        },
        "city": "Dierikon",
        "state": "Basel-Stadt",
        "country": "Switzerland",
        "postcode": 5075,
        "coordinates": {
          "latitude": "-58.3405",
          "longitude": "134.0131"
        },
        "timezone": {
          "offset": "+4:30",
          "description": "Kabul"
        }
      },
      "email": "salome.roy@example.com",
      "login": {
        "uuid": "dfda3e32-b8b1-44c9-9aa9-194fc17833d3",
        "username": "organiccat614",
        "password": "nacked",
        "salt": "HRepWJ2P",
        "md5": "643f7a890ba9c9fbe04ea971287f57ba",
        "sha1": "9407fd8fdf0c344ac1990a89d8d0190f6baabd19",
        "sha256": "1317478dbfc61c3feaccea4485a367fb6b195009f15eecd9175f2d1a9215d5df"
      },
      "dob": {
        "date": "1960-05-12T07:27:42.104Z",
        "age": 63
      },
      "registered": {
        "date": "2021-05-02T04:18:14.996Z",
        "age": 2
      },
      "phone": "077 228 21 12",
      "cell": "078 051 38 48",
      "id": {
        "name": "AVS",
        "value": "756.1071.1525.27"
      },
      "picture": {
        "large": "https://randomuser.me/api/portraits/women/74.jpg",
        "medium": "https://randomuser.me/api/portraits/med/women/74.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/women/74.jpg"
      },
      "nat": "CH"
    }
  ],
  "info": {
    "seed": "b7ef95d3b252edca",
    "results": 1,
    "page": 1,
    "version": "1.4"
  }
}
```
<!-- cspell:enable -->

## Filtering the output

Imagine we just need to retrieve the name. To do this, we need to better understand the JSON object.

```json
{
  //highlight-next-line
  "results": [
    {
      "gender": "female",
      //highlight-next-line
      "name": {
        "title": "Mademoiselle",
        "first": "Salomé",
        "last": "Roy"
      },
      "location": {
        [...]
      },
      [...]
  ],
  [...]
}
```

The output is a JSON representation having a root property called `results`. That property is an array. Each element in that array has a `name` node with a few properties like `title`, `first` and `last`.

If we just want to retrieve the `name` node, the filter to use with `jq` is `.results[0].name`.

<Terminal>
$ curl --silent https://randomuser.me/api/ | jq '.results[0].name'
</Terminal>

```json
{
  "title": "Ms",
  "first": "Brooke",
  "last": "Morgan"
}
```

Learn more about [jq filtering](https://jqlang.github.io/jq/tutorial/).
