self.onmessage = (event) => {
    const sharedBuffer = event.data.buffer;
    const sharedView = new Int32Array(sharedBuffer);

    sharedView[0] = 42;
    console.log("Worker wrote 42 into slot 0");

};

