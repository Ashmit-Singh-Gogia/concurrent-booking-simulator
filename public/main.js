import { ERRORS, MAX_REQUESTS, MAX_SEAT_SELECTION } from "./constants/constants.js";
import { getSeatView } from "./shared_state/shared_state.js"
import { isValidSeat } from "./common/validateSeat.js";
import { seatToIndex } from "./seat_model/seat_model.js";
import { getArrayOfSeats, getSeatIndices } from "./common/parseSeats.js"


// dom elements
document.getElementById("simbtn-unsafe").addEventListener("click", runUnsafeSimulation);
document.getElementById("simbtn-safe").addEventListener("click", runSafeSimulation);
document.getElementById("simbtn-global").addEventListener("click", runGlobalLockSimulation);




// functions calling workers
function runUnsafeSimulation() {
    const inputElement = document.getElementById("unsafe-sim-numberOfWorkers")
    // seat value taken 
    const seat = document.getElementById("unsafe-sim-seat").value;

    // validate single seat here...
    if (!isValidSeat(seat)) {
        throw new Error(ERRORS.INVALID_SEAT);
    }

    // validate number of requests
    const count = parseInt(inputElement.value, 10) || 5
    if (count > MAX_REQUESTS) {
        throw new Error(ERRORS.TOO_MANY_REQUESTS);
    }

    // maintains if number of workers created and ready are same
    let counterOfReadyWorkers = 0, countOfFailedWorkers = 0, BookedSeats = 0;
    const barrierSab = new SharedArrayBuffer(4);
    const barrierView = new Int32Array(barrierSab);


    const workers = [];
    let notified = false; // so we dont call Atomic.notify() multiple times
    for (let i = 0; i < count; i++) {
        const workerInfo = {
            workerId: i,
            targetSeat: seatToIndex(seat),
            seat: seat,
            seatView: getSeatView(),
            barrierView: barrierView,
        }
        const worker = new Worker("./workers/unsafe_worker.js");

        workers.push(worker);
        worker.postMessage(workerInfo)

        worker.onmessage = (ev) => {
            const { status, workerId } = ev.data;
            // every time a worker is ready it sends a message and is caught here
            if (status === 'READY') {
                counterOfReadyWorkers++;
            } else if (status === 'FAILED') {
                countOfFailedWorkers++;
            } else if (status === 'BOOKED') {
                BookedSeats++;
            }

            if (counterOfReadyWorkers + countOfFailedWorkers == count && !notified) {
                notified = true;
                barrierView[0] = 10; // changed value
                Atomics.notify(barrierView, 0, count);
                console.log("Notified all sleeping workers: ")
            }
            if (BookedSeats + countOfFailedWorkers === count) {
                console.log(`Final Results : Total Requests : ${count} , Total Successfull Bookings : ${BookedSeats} , Duplicate Bookings : ${BookedSeats - 1 >= 0 ? BookedSeats - 1 : 0},  SEAT: ${seat} , Failed Requests: ${count - BookedSeats}`);
                for (const w of workers) {
                    w.terminate();
                }
            }

        }
    }
}

// Safe simulations without locks using Atomic.CompareExhange
function runSafeSimulation() {
    const inputElement = document.getElementById("safe-sim-numberOfWorkers");
    // seat value taken 
    const seat = document.getElementById("safe-sim-seat").value;

    // validate single seat here...
    if (!isValidSeat(seat)) {
        throw new Error(ERRORS.INVALID_SEAT);
    }

    // validate number of requests
    const count = parseInt(inputElement.value, 10) || 5
    if (count > MAX_REQUESTS) {
        throw new Error(ERRORS.TOO_MANY_REQUESTS);
    }

    let counterOfReadyWorkers = 0, countOfFailedWorkers = 0, BookedSeats = 0;
    let raceLostWorkers = 0;
    const barrierSab = new SharedArrayBuffer(4);
    const barrierView = new Int32Array(barrierSab);

    const workers = [];
    let notified = false; // so we dont call Atomic.notify() multiple times
    for (let i = 0; i < count; i++) {
        const workerInfo = {
            workerId: i,
            targetSeat: seatToIndex(seat),
            seat: seat,
            seatView: getSeatView(),
            barrierView: barrierView,
        }
        const worker = new Worker("./workers/safe_worker.js");

        workers.push(worker);
        worker.postMessage(workerInfo)

        worker.onmessage = (ev) => {
            const { status, workerId } = ev.data;
            // every time a worker is ready it sends a message and is caught here
            if (status === 'READY') {
                counterOfReadyWorkers++;
            } else if (status === 'FAILED') {
                countOfFailedWorkers++;
            } else if (status === 'BOOKED') {
                BookedSeats++;
            } else if (status === 'ALREADY_BOOKED') { // or 'RACE_LOST'
                raceLostWorkers++;
            }

            if (counterOfReadyWorkers + countOfFailedWorkers == count && !notified) {
                notified = true;
                barrierView[0] = 10; // changed value
                Atomics.notify(barrierView, 0, count);
                console.log("Notified all sleeping workers: ")
            }
            if (BookedSeats + raceLostWorkers + countOfFailedWorkers === count) {
                console.log(`Requests: ${count} | Successful: ${BookedSeats} | Race Lost: ${raceLostWorkers} | Duplicates: 0`);
                for (const w of workers) {
                    w.terminate();
                }
            }

        }
    }
}

function runGlobalLockSimulation() {
    const inputElement = document.getElementById("global-sim-numberOfWorkers");
    const count = parseInt(inputElement.value, 10) || 5    // seat value taken 

    if (count > MAX_REQUESTS) {
        throw new Error(ERRORS.TOO_MANY_REQUESTS);
    }

    const seat = document.getElementById("global-sim-seat").value;
    // Distribute the seat into an array of seats

    const seats = getArrayOfSeats(seat);
    // Validate all the seats
    for (let i = 0; i < seats.length; i++) {
        if (!isValidSeat(seats[i])) {
            throw new Error(ERRORS.INVALID_SEAT);
        }
    }

    // Might sort seats array here

    if (seats.length > MAX_SEAT_SELECTION) {
        throw new Error(ERRORS.TOO_MANY_SEATS);
    }


    const globalSharedBufferLock = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
    const globalLockView = new Int32Array(globalSharedBufferLock);

    const barrierSab = new SharedArrayBuffer(4);
    const barrierView = new Int32Array(barrierSab);

    const workers = [];
    const chunkSize = Math.floor(seats.length / count); // Number of seats / Count Of workers
    const remainingSeats = seats.length % count; // Number of seats % Count Of Workers -> Given to 1sr worker 
    let startIdx = 0;

    let readyCount = 0, bookedCount = 0, alreadyBookedCount = 0, doneCount = 0;
    let notified = false;

    for (let i = 0; i < count; i++) {
        const worker = new Worker("./workers/global_worker.js");
        workers.push(worker);
        let allotedSeats = [];

        if (i === 0) {
            allotedSeats = seats.slice(startIdx, startIdx + chunkSize + remainingSeats);
            startIdx += chunkSize + remainingSeats;
        } else {
            allotedSeats = seats.slice(startIdx, startIdx + chunkSize);
            startIdx += chunkSize;
        }
        const allotedSeatIndices = getSeatIndices(allotedSeats);
        const workerInfo = {
            workerId: i,
            targetSeats: allotedSeats,      // direct seats are sent -> A1 , E3 , etc,
            targetSeatIndices: allotedSeatIndices,  // indices of the seats are sent
            seatView: getSeatView(),
            globalLockView: globalLockView,
            barrierView: barrierView,
        }

        worker.postMessage(workerInfo);

        worker.onmessage = (ev) => {
            const { status, workerId, seat } = ev.data;

            if (status === 'READY') {
                readyCount++;
            } else if (status === 'BOOKED') {
                bookedCount++;
            } else if (status === 'ALREADY_BOOKED') {
                alreadyBookedCount++;
            } else if (status === 'DONE') {
                doneCount++;
            }

            // Release barrier once all workers are ready
            if (readyCount === count && !notified) {
                notified = true;
                barrierView[0] = 10;
                Atomics.notify(barrierView, 0, count);
                console.log("Global Lock Sim: All workers ready — releasing barrier");
            }

            // All workers finished processing their seats
            if (doneCount === count) {
                console.log(`Global Lock Sim → Workers: ${count} | Seats: ${seats.length} | Booked: ${bookedCount} | Already Booked: ${alreadyBookedCount}`);
                for (const w of workers) {
                    w.terminate();
                }
            }
        }
    }
}