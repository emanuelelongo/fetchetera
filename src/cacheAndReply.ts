import CachePolicy from 'http-cache-semantics';
import {Response} from 'node-fetch';
import RequestAdapter from './RequestAdapter';
import {Cache, CacheEntry, AwaitableCache} from './types';
import log from './log';


export default async function cacheAndReply(
    request: RequestAdapter,
    response: Response,
    policy: CachePolicy,
    cache: Cache | AwaitableCache
): Promise<Response> {

    if (policy.storable()) {
        log('Request is storable, saving in cache');
        const body = await response.text();
        const cacheEntry: CacheEntry = {
            policy: policy.toObject(),
            url: request.url,
            status: response.status,
            body
        };
        await cache.set(request.url, cacheEntry);

        return new Response(body, {
            status: response.status,
            headers: response.headers
        });
    }
    return response;
}
