import { spawnWorkers } from "../core/worker-manager.js";
import { getSharedBuffer } from "../core/shared-state.js";
import { seatIdToIndex, seatIndexToId } from "../core/seat-model.js";
import { SIMULATION_LIMITS, seatStateName } from "../core/constants.js";
import { logEvent } from "../core/event-log.js";



export function validateConfig({ requestCount, selectedSeatIds }) {
    const errors = [];

    if (!Number.isInteger(requestCount) || requestCount <= 0) {
        errors.push("Request count must be a whole number greater than 0.");
    } else if (requestCount > SIMULATION_LIMITS.MAX_REQUESTS) {
        errors.push(`Request count can't exceed ${SIMULATION_LIMITS.MAX_REQUESTS}.`);
    }

    if (!selectedSeatIds || selectedSeatIds.length === 0) {
        errors.push("Select at least one seat.");
    } else if (new Set(selectedSeatIds).size != selectedSeatIds.length) {
        errors.push("Duplicate seats are not allowed");
    }
    return errors;
}

export function runRaceConditionSimulation({ requestCount, selectedSeatIds, mode }, onComplete) {
    const errors = validateConfig({ requestCount, selectedSeatIds });
    if (errors.length > 0) {
        onComplete({ errors });
        return;
    }

    const barrierBuffer = new SharedArrayBuffer(4);
    const outcomes = [];
    let finishedCount = 0;

    const configs = Array.from({ length: requestCount }, (_, requestId) => {
        const seatId = selectedSeatIds[requestId % selectedSeatIds.length];
        return {
            requestId,
            seatIndex: seatIdToIndex(seatId),
            mode,
            sharedBuffer: getSharedBuffer(),
            barrierBuffer,
            expectedCount: requestCount,
            runId: "run",
        };
    });

    spawnWorkers(configs, (event) => {
        logEvent({
            requestId: event.requestId,
            seatId: seatIndexToId(event.seatIndex),
            action: event.action,
            result: typeof event.result === "number" ? seatStateName(event.result) : event.result,
            timestamp: event.timestamp,
        });

        if (event.action === "outcome") {
            outcomes.push({ seatId: seatIndexToId(event.seatIndex), outcome: event.result });
            finishedCount++;
            if (finishedCount === requestCount) {
                onComplete({ metrics: computeMetrics(outcomes, requestCount) });
            }
        }
    });
}


function computeMetrics(outcomes, requestCount) {
    const successesBySeat = new Map();
    let rejectedCount = 0;

    outcomes.forEach(({ seatId, outcome }) => {
        if (outcome === "BOOKED") {
            successesBySeat.set(seatId, (successesBySeat.get(seatId) || 0) + 1);
        } else {
            rejectedCount++;
        }
    });

    let successfulWrites = 0;
    let duplicateBookings = 0;
    successesBySeat.forEach((count) => {
        successfulWrites += count;
        if (count > 1) duplicateBookings += count - 1;
    });

    return {
        totalRequests: requestCount,
        successfulWrites,
        rejectedCount,
        duplicateBookings,
        raceDetected: duplicateBookings > 0
    };

}