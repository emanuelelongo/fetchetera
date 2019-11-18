import nock from 'nock';
import fetchetera from '..';

describe('Request headers integrity', () => {
    test('should forward headers to the origin', async () => {
        nock('http://www.test.com', {reqheaders: {'custom-header': 'custom-value'}})
            .get('/foo/bar')
            .once()
            .reply(200);

        const fetch = fetchetera(new Map());
        await fetch(`http://www.test.com/foo/bar`, {headers: {'custom-header': 'custom-value'}});
        expect(nock.isDone()).toBeTruthy();
    });

    test('should revalidating cached response using new request headers', async () => {
        nock('http://www.test.com', {reqheaders: {'custom-header': 'custom-value-1'}})
            .get('/foo/bar')
            .once()
            .reply(200, 'Hello, world.', {
                etag: '"123456789"'
            });

        nock('http://www.test.com', {
            reqheaders: {
                'if-none-match': '"123456789"',
                'custom-header': 'custom-value-2'
            }})
            .get('/foo/bar')
            .once()
            .reply(304, '', {
                etag: '"123456789"'
            });

        const fetch = fetchetera(new Map());
        await fetch(`http://www.test.com/foo/bar`, {headers: {'custom-header': 'custom-value-1'}});
        await fetch(`http://www.test.com/foo/bar`, {headers: {'custom-header': 'custom-value-2'}});
        expect(nock.isDone()).toBeTruthy();
    });

});
