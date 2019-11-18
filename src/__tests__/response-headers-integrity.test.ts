import nock from 'nock';
import fetchetera from '..';

describe('Response headers integrity', () => {
    test('should preserve headers when response comes from cache w/o revalidation', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                'cache-control': 'max-age=20',
                'custom-header': 'custom-value'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(res.headers.get('custom-header')).toBe('custom-value');
        expect(nock.isDone()).toBeTruthy();
    });

    test('should preserve headers when response comes from a revalidated (304) cache', async () => {
        nock('http://www.test.com')
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                etag: '"123456789"',
                'custom-header': 'custom-value'
            });

        nock('http://www.test.com', {reqheaders: {'if-none-match': '"123456789"'}})
            .get('/foo/bar')
            .once()
            .reply(304, '', {
                // NB: without an etag from the origin, headers wouldn't have been returned from cache
                // rfc7232 section-4.1: "The server generating a 304 response MUST generate any
                // of the [...] header fields that would have been sent in a 200 (OK) response"
                etag: '"123456789"'
            });

        const fetch = fetchetera(new Map());

        await fetch(`http://www.test.com/foo/bar`);

        const res = await fetch(`http://www.test.com/foo/bar`);
        const body = await res.text();

        expect(body).toBe('Hello, world.');
        expect(res.headers.get('custom-header')).toBe('custom-value');
        expect(nock.isDone()).toBeTruthy();
    })
});
