import {Headers} from 'node-fetch';
import CachePolicy from 'http-cache-semantics';
import {PlainHeaders} from './types';

function toPlainHeaders(headers: Headers | CachePolicy.Headers): PlainHeaders {
    let hs: PlainHeaders = {};
    if (headers instanceof Headers) {
        headers.forEach((value, key) => {
            hs[key] = value;
        });
    }
    else {
        let value;
        for (let key in headers) {
            value = headers[key];
            if (typeof (value) == 'string')
                hs[key] = value;
        }
    }
    return hs;
}

export default toPlainHeaders;
