import {Response} from 'node-fetch';
import {CacheEntry} from './types';
import RequestAdapter from './RequestAdapter';
import toPlainHeaders from './toPlainHeaders';
import CachePolicy from 'http-cache-semantics';

export default async function validateCacheEntry(cacheEntry: CacheEntry, request: RequestAdapter): Promise<{reusable: boolean, response?: Response}> {
    const {status, body, policy} = cacheEntry;
    const deserializedPolicy = CachePolicy.fromObject(policy);

    if (deserializedPolicy.satisfiesWithoutRevalidation(request.toCachePolicyFormat())) {
        return {
            reusable: true,
            response: new Response(body, {
                status,
                headers: toPlainHeaders(deserializedPolicy.responseHeaders())
            })
        }
    }
    return ({
        reusable: false
    });
}
