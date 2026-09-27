self.onmessage = (event) => {
    const timeStarted = performance.now();
    self.postMessage({ action: "started", timeStamp: timeStarted });

    const delay = Math.random() * 300;

    setTimeout(() => {
        const timeEnded = performance.now();
        self.postMessage({ action: "finished", timeStamp: timeEnded, timeTaken: timeEnded - timeStarted });

    }, delay);
};