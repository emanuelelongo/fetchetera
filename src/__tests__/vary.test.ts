import nock from 'nock';
import fetchetera from '..';
import {flashForward} from './timeTravelUtils';

describe('Vary', () => {
    test('should not use cached response due to different user-agent', async () => {
        nock('http://www.test.com', {reqheaders:{'user-agent': 'chrome'}})
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'vary': 'user-agent',
                'cache-control': 'max-age:20'
            });

        nock('http://www.test.com', {reqheaders:{'user-agent': 'firefox'}})
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.');


        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`, {headers: {'user-agent': 'chrome'}});

        await flashForward(15, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`, {headers: {'user-agent':'firefox'}});
            const body = await res.text();
            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });

    test('shuld use the cached copy since the user-agent is the same', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'vary': 'user-agent',
                'cache-control': 'max-age=20'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`, {headers: {'user-agent':'chrome'}});

        await flashForward(15, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`, {headers: {'user-agent':'chrome'}});
            const body = await res.text();
            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });
});
