const backupNow = Date.now;

/**
 * @param n Number of seconds
 * Remember to not interact with your parents if you go to the past.
 */
async function flashForward(n: number, callback: () => Promise<void>) {
    // @ts-ignore
    Date.now = jest.fn(() => {
        let d = new Date();
        d.setSeconds(d.getSeconds() + n);
        return d;
    });

    await callback();
    backToThePresent();
}

function backToThePresent() {
    Date.now = backupNow;
}

export {
    flashForward,
}
