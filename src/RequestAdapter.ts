import {Request as CachePolicyRequest} from 'http-cache-semantics';
import {RequestOptions} from './types';

class RequestAdapter {
    url: string;
    opts: RequestOptions;

    constructor(url: string, opts?: RequestOptions) {
        this.url = url;
        this.opts = opts || {};
        this.opts.headers = this.opts.headers || {};
        this.opts.method = this.opts.method || 'GET';
    }

    toCachePolicyFormat(): CachePolicyRequest {
        return {
            url: this.url,
            method: this.opts && this.opts.method || 'GET',
            headers: this.opts.headers || {}
        }
    }
}

export default RequestAdapter;
