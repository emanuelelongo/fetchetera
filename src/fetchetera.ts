import CachePolicy from 'http-cache-semantics';
import fetch, {Response} from 'node-fetch';
import RequestAdapter from './RequestAdapter';
import log from './log';
import cacheAndReply from './cacheAndReply';
import toPlainHeaders from './toPlainHeaders';
import validateCacheEntry from './validateCacheEntry';
import revalidateCacheEntry from './revalidateCacheEntry';
import {RequestOptions, Cache, AwaitableCache} from './types';

export default (cache: Cache | AwaitableCache) => {

    return async (url: string, opts?: RequestOptions) : Promise<Response> => {
        const request = new RequestAdapter(url, opts);
        const cacheEntry = await cache.get(url);

        if (cacheEntry) {
            log('There is a copy in cache for this request');

            let {reusable, response: reusableResponse} = await validateCacheEntry(cacheEntry, request);
            if (reusable && reusableResponse) {
                log('Cached copy can be used without revalidation');
                return reusableResponse;
            }

            log('Cached copy needs to be revalidated');
            let {policy, response} = await revalidateCacheEntry(cacheEntry, request);
            return cacheAndReply(request, response, policy, cache);
        }

        log(`Executing request: ${request.url} with headers: ${request.opts? JSON.stringify(request.opts.headers, null, 4) : ''}`);
        const response = await fetch(request.url, request.opts)
        const policy = new CachePolicy(request.toCachePolicyFormat(),
            {status: response.status, headers: toPlainHeaders(response.headers)},
            {shared: true}
        );
        return cacheAndReply(request, response, policy, cache);
    }
};
