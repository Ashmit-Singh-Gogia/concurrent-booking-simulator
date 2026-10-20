import { ERRORS, MAX_REQUESTS } from "./constants/constants.js";
import { getSeatView } from "./shared_state/shared_state.js"
import { isValidSeat } from "./common/validateSeat.js";
import { seatToIndex } from "./seat_model/seat_model.js";

// dom elements

// unsafe simulation elements
const inputElement = document.getElementById("unsafe-sim-numberOfWorkers")
document.getElementById("simbtn-unsafe").addEventListener("click", runUnsafeSimulation);




// functions calling workers
function runUnsafeSimulation() {

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
                console.log(`Final Results : Total Requests : ${count} , Total Successfull Bookings : ${BookedSeats} , Duplicate Bookings : ${BookedSeats - 1 >= 0 ? BookedSeats - 1 : 0},  SEAT: ${seat}`);
                for (const w of workers) {
                    w.terminate();
                }
            }

        }
    }
}
