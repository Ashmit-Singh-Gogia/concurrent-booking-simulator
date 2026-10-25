// per_seat_lock_worker.js
onmessage = (ev) => {
    const { seatView, lockView, targetSeatIndices, targetSeats, barrierView, workerId } = ev.data;

    postMessage({ status: 'READY', workerId });
    Atomics.wait(barrierView, 0, 0);

    for (let i = 0; i < targetSeatIndices.length; i++) {
        const seatIdx = targetSeatIndices[i];
        const seatName = targetSeats[i];

        // 1. Acquire lock for THIS specific seat (wait only on seatIdx)
        while (Atomics.compareExchange(lockView, seatIdx, 0, 1) !== 0) {
            Atomics.wait(lockView, seatIdx, 1);
        }

        // 2. Simulated work (identical to global lock)
        let sum = 0;
        for (let k = 0; k < 10000000; k++) sum += k;

        // 3. Book or detect already taken (identical to global lock)
        if (seatView[seatIdx] === 0) {
            seatView[seatIdx] = 1;
            postMessage({ status: 'BOOKED', workerId, seat: seatName });
        } else {
            postMessage({ status: 'ALREADY_BOOKED', workerId, seat: seatName });
        }

        // 4. Release lock for THIS seat (wake up someone waiting for this seat)
        Atomics.store(lockView, seatIdx, 0);
        Atomics.notify(lockView, seatIdx, 1);
    }

    postMessage({ status: 'DONE', workerId });
};
