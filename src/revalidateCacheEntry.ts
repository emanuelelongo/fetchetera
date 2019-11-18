import CachePolicy from 'http-cache-semantics';
import fetch, {Response} from 'node-fetch';
import RequestAdapter from './RequestAdapter';
import log from './log';
import {CacheEntry} from './types';
import toPlainHeaders from './toPlainHeaders';

export default async function revalidateCacheEntry(cacheEntry: CacheEntry, request: RequestAdapter) : Promise<{policy: CachePolicy, response: Response}> {
    const {policy: cachedPolicy, body: cachedBody, status: cachedStatus} = cacheEntry;
    const deserializedCachedPolicy = CachePolicy.fromObject(cachedPolicy);
    request.opts.headers = toPlainHeaders(deserializedCachedPolicy.revalidationHeaders(request.toCachePolicyFormat()));

    log(`Executing request: ${request.url} with headers: ${JSON.stringify(request.opts.headers, null, 4)}`);
    const response = await fetch(request.url, request.opts);

    const {modified, policy} = deserializedCachedPolicy.revalidatedPolicy(request.toCachePolicyFormat(), {
        status: response.status,
        headers: toPlainHeaders(response.headers)
    });

    if (!modified) {
        log('Cached response is still valid');
        return {
            policy: policy,
            response: new Response(cachedBody, {
                status: cachedStatus,
                headers: toPlainHeaders(policy.responseHeaders())
            })
        }
    }
    log('Cached response no more valid');
    return ({
        policy: policy,
        response: response
    });
}

