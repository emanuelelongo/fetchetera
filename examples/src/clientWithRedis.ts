import Keyv from 'keyv';
import '@keyv/redis';
import {emitKeypressEvents} from 'readline';
import fetchetera, {CacheEntry} from 'fetchetera';

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const SERVER_PORT = process.env.SERVER_PORT;
const REDIS_PORT = process.env.REDIS_PORT;

const names = ['Huey', 'Karyn', 'Quintin', 'Carlos', 'Chandra', 'Belinda', 'Augustine', 'Robin', 'Brad'];

const fetch = fetchetera(new Keyv<CacheEntry>(`redis://localhost:${REDIS_PORT}`));

process.stdin.on('keypress', async (_, key) => {
    if (key.ctrl && key.name === 'c')
        process.exit();

    const nameIndex = isNaN(key.name) ? Math.floor(Math.random() * names.length) : parseInt(key.name);
    const res = await fetch(`http://localhost:${SERVER_PORT}/test/${names[nameIndex]}`);
    console.log('response: ', await res.text());
    console.log();
});
console.clear();
console.log('Type a digit [0-9] to continue or CTRL-c to exit');

