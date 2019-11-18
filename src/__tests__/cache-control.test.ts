import nock from 'nock';
import fetchetera from '..';

describe('Not cacheable', () => {
    test('should not cache response w/o cache headers', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .twice()
            .reply(200, 'Hello, world.');

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(nock.isDone()).toBeTruthy();
    });

    test('should not cache response w/ cache-control: private', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .twice()
            .reply(200, 'Hello, world.', {
                'cache-control': 'private, max-age=10'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(nock.isDone()).toBeTruthy();
    });

    test('should cache response w/ cache-control: public', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'cache-control': 'public, max-age=10'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(nock.isDone()).toBeTruthy();
    });

    test('should not cache response w/ cache-control: no-store', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .twice()
            .reply(200, 'Hello, world.', {
                'cache-control': 'no-store'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(nock.isDone()).toBeTruthy();
    });
});
