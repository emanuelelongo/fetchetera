# Fetchetera
[![NPM](https://nodei.co/npm/fetchetera.png)](https://npmjs.org/package/fetchetera)

[![Build Status](https://travis-ci.org/emanuelelongo/fetchetera.svg?branch=master)](https://travis-ci.org/emanuelelongo/fetchetera)
[![Maintainability](https://api.codeclimate.com/v1/badges/c255d3146d23946d3655/maintainability)](https://codeclimate.com/github/emanuelelongo/fetchetera/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c255d3146d23946d3655/test_coverage)](https://codeclimate.com/github/emanuelelongo/fetchetera/test_coverage)

Warp [node-fetch](https://www.npmjs.com/package/node-fetch) adding cache
support.

`fetchetera` doesn't implement the cache storage itself because there are plenty of
them on npm.

The following example uses the well known [lru-cache](https://www.npmjs.com/package/lru-cache) package.

Example:

``` js
import fetchetera from 'fetchetera';
import LRU from 'lru-cache';

// prepare the fetch function initializing the cache
const fetch = fetchetera(new LRU({max: 100}));

// use like regular fetch
const res = await fetch('https://swapi.co/api/people/1/}');
console.log('response: ', await res.json());
```

## Universal usage
For a _universal_ use of `fetchetera`, simply assing the initilized fetch to `global.fetch` object.
Make sure to do so **only** on the server.

``` js
...
const fetch = fetchetera(new LRU({max: 100}));
global.fetch = fetch;
```

## Using with a distribuited cache
This example uses another package `Keyv` that supports Redis as storage.

``` js
import fetchetera from 'fetchetera';
import Keyv from 'keyv';
import '@keyv/redis';

// prepare the fetch function initializing the cache
const fetch = fetchetera(new Keyv<CacheEntry>(`redis://localhost:6379`));

// use like regular fetch
const res = await fetch('https://swapi.co/api/people/1/}');
console.log('response: ', await res.json());
```

To try it, you need redis running on localhost:

``` sh
docker run --rm --name my-redis -p 6379:6379 -d redis

```


## See caching in action
Debugging or just watch cache _happening_ is a bit tricky because caching is
transparent to the user. You don't know if a cached response is being used
or if the origin returned a `304` for a revalidation.

Instead of putting `console.log` here and there, you can setup a reverse proxy
to inspect the communication with the origin and then address the requests to
the proxy.

For example the following command redirect all traffic from port 1337 to
3000 port and dumps all the communications:

``` sh
docker run --rm -it -p 1337:1337 mitmproxy/mitmproxy mitmdump -v -p 1337 -m reverse:http://host.docker.internal:3000
```


