onmessage = (ev) => {
    const { seatView, targetSeatIndices, targetSeats, barrierView, workerId } = ev.data;

    // Signal ready
    postMessage({ status: 'READY', workerId });

    Atomics.wait(barrierView, 0, 0);

    for (let i = 0; i < targetSeatIndices.length; i++) {
        const seatIdx = targetSeatIndices[i];
        const seatName = targetSeats[i];


        // simulated fake expensive work to see some difference in all sim ( This code is in all simulations so its not rigged)
        let sum = 0;
        for (let k = 0; k < 10000000; k++) sum += k;

        // Atomic compare-and-exchange: only one worker can swap 0→1
        const result = Atomics.compareExchange(seatView, seatIdx, 0, 1);

        if (result === 0) {
            // We were the one who changed it from 0 to 1
            console.log(`Worker ${workerId}: Booked seat ${seatName} ✅`);
            postMessage({ status: 'BOOKED', workerId, seat: seatName });
        } else {
            // Already 1 when we checked — someone else got it
            console.log(`Worker ${workerId}: Seat ${seatName} already taken ❌`);
            postMessage({ status: 'ALREADY_BOOKED', workerId, seat: seatName });
        }
    }

    postMessage({ status: 'DONE', workerId });
}
