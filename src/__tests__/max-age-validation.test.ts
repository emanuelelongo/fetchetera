import nock from 'nock';
import {flashForward} from './timeTravelUtils';
import fetchetera from '..';

describe('max-age validation', () => {
    test('should use cached copy without revalidation', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'cache-control': 'max-age=20'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        await flashForward(15, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`);
            const body = await res.text();
            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });

    test('should not use an expired cached copy', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .twice()
            .reply(200, 'Hello, world.', {
                'cache-control': 'max-age=20'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        await flashForward(30, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`);
            const body = await res.text();
            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });
});
