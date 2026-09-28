export const SEAT_STATE = Object.freeze({
    AVAILABLE: 0,
    LOCKED: 1,
    BOOKED: 2,
});


export const SIMULATION_LIMITS = Object.freeze({
    MAX_REQUESTS: 2000,
    MAX_WORKERS: 500
});

export function seatStateName(value) {
    for (const key in SEAT_STATE) {
        if (SEAT_STATE[key] === value) {
            return key;
        }
    }
    return "UNKNOWN";
}
