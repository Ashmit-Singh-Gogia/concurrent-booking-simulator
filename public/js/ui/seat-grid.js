import { ROWS, SEATS_PER_ROW, seatIdToIndex } from '../core/seat-model.js';
import { getSeatState } from '../core/shared-state.js';
import { SEAT_STATE } from '../core/constants.js';

const STATE_CLASS = {
    [SEAT_STATE.AVAILABLE]: "seat-available",
    [SEAT_STATE.LOCKED]: "seat-locked",
    [SEAT_STATE.BOOKED]: "seat-booked",
};

export function renderSeatGrid(container) {
    container.innerHTML = "";

    ROWS.forEach(row => {
        const rowEl = document.createElement("div");
        rowEl.className = "seat-row";

        const label = document.createElement("span");
        label.className = "row-label";
        label.textContent = row;
        rowEl.appendChild(label);

        for (let seatNum = 1; seatNum <= SEATS_PER_ROW; seatNum++) {
            const seatEl = document.createElement("button");
            seatEl.className = "seat";
            seatEl.dataset.seatId = `${row}${seatNum}`; // might be an error here
            seatEl.textContent = seatNum;
            rowEl.appendChild(seatEl);
        }
        container.appendChild(rowEl);
    });
    refreshSeatDisplay(container);
}

export function refreshSeatDisplay(container) {
    container.querySelectorAll(".seat").forEach((seatEl) => {
        const state = getSeatState(seatIdToIndex(seatEl.dataset.seatId));
        seatEl.classList.remove("seat-available", "seat-locked", "seat-booked");
        seatEl.classList.add(STATE_CLASS[state]);
    });
}
