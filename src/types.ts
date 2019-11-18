import CachePolicy from 'http-cache-semantics';
import {RequestInit} from 'node-fetch';

export interface CacheEntry {
    policy: CachePolicy.CachePolicyObject,
    url: string;
    status: number;
    body: string;
}

export interface Cache {
    get: (key: string) => CacheEntry | undefined,
    set: (key: string, value: CacheEntry) => any
}

export interface AwaitableCache {
    get: (key: string) => Promise<CacheEntry>,
    set: (key: string, value: CacheEntry) => any
}

export type PlainHeaders = {[key: string]: string }

export type RequestOptions = Omit<RequestInit, 'headers'> & {headers?: PlainHeaders};

