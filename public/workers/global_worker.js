onmessage = (ev) => {
    const { seatView, targetSeatIndices, targetSeats, globalLockView, barrierView, workerId } = ev.data;

    // Signal ready to main thread
    postMessage({ status: 'READY', workerId });

    // Wait for all workers to be ready
    Atomics.wait(barrierView, 0, 0);

    // Process each assigned seat
    for (let i = 0; i < targetSeatIndices.length; i++) {
        const seatIdx = targetSeatIndices[i];
        const seatName = targetSeats[i];

        // Acquire the global lock (spin until we swap 0 → 1)
        while (Atomics.compareExchange(globalLockView, 0, 0, 1) !== 0) {
            Atomics.wait(globalLockView, 0, 1);
        }

        // Critical section — only one worker can be here at a time
        if (seatView[seatIdx] === 0) {
            seatView[seatIdx] = 1;
            console.log(`Worker ${workerId}: Booked seat ${seatName} ✅`);
            postMessage({ status: 'BOOKED', workerId, seat: seatName });
        } else {
            console.log(`Worker ${workerId}: Seat ${seatName} already taken ❌`);
            postMessage({ status: 'ALREADY_BOOKED', workerId, seat: seatName });
        }

        // Release the global lock
        Atomics.store(globalLockView, 0, 0);
        Atomics.notify(globalLockView, 0, 1);
    }

    postMessage({ status: 'DONE', workerId });
}
