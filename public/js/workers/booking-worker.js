self.onmessage = (event) => {
    const { requestId, seatIndex, sharedBuffer } = event.data;
    const seatView = new Int32Array(sharedBuffer);

    self.postMessage({
        requestId,
        seatIndex,
        action: "read",
        result: seatView[seatIndex],
        timestamp: performance.timeOrigin + performance.now(),
    });
};
