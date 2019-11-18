import nock from 'nock';
import {flashForward} from './timeTravelUtils';
import fetchetera from '..';

describe('ETag revalidation', () => {
    test('successfully revalidate etag', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                etag: '"123456789"'
            });

        nock('http://www.test.com', {reqheaders: {'if-none-match': '"123456789"'}})
            .get('/foo/bar')
            .once()
            .reply(304, '', {etag: '"123456789"'});


        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(nock.isDone()).toBeTruthy();
    });

    test('successfully revalidate etag on an expired cache copy', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'cache-control': 'max-age=20',
                etag: '"123456789"'
            });

        nock('http://www.test.com', {reqheaders: {'if-none-match': '"123456789"'}})
            .get('/foo/bar')
            .once()
            .reply(304, '', {
                'cache-control': 'max-age=20',
                etag: '"123456789"'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        await flashForward(25, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`);
            const body = await res.text();

            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });

    test('fails on revalidation of an expired cache copy', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'cache-control': 'max-age=20',
                etag: '"123456789"'
            });

        nock('http://www.test.com', {reqheaders: {'if-none-match': '"123456789"'}})
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.');

        const fetch = fetchetera(new Map());


        await fetch(`http://www.test.com/foo/bar`);

        await flashForward(25, async () => {
            const res = await fetch(`http://www.test.com/foo/bar`);
            const body = await res.text();

            expect(body).toBe('Hello, world.');
            expect(nock.isDone()).toBeTruthy();
        });
    });

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
});
