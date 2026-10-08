import { showPage } from "./ui/page-router.js";
import { renderSeatGrid, refreshSeatDisplay } from "./ui/seat-grid.js";
import { toggleSeatSelection, getSelectedSeats, clearSelection } from "./ui/seat-selection.js";
import { getSeatState, getSeatView, resetAllSeats } from "./core/shared-state.js";
import { seatIdToIndex } from "./core/seat-model.js";
import { SEAT_STATE, seatStateName } from "./core/constants.js";
import { attemptBooking } from "./core/booking-engine.js";
import { initEventLog, logEvent, clearEventLog } from "./core/event-log.js";
import { runRaceConditionSimulation } from "./simulations/race-condition.js";
import { runIndependentSeatSimulation } from "./simulations/independent-seat.js";

const seatGridEl = document.getElementById("seat-grid");
const confirmBtn = document.getElementById("confirm-selection");
const popupEl = document.getElementById("booking-popup");
const popupSeatListEl = document.getElementById("popup-seat-list");

initEventLog(document.getElementById("log"));

function updateConfirmButton() {
  confirmBtn.disabled = getSelectedSeats().length === 0;
}

function handleSeatClick(seatId) {
  const state = getSeatState(seatIdToIndex(seatId));
  if (state !== SEAT_STATE.AVAILABLE) return;

  const result = toggleSeatSelection(seatId);
  if (!result.changed) {
    alert(result.reason);
    return;
  }
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
}

async function handleConfirmBooking() {
  const seatIds = getSelectedSeats();
  const seatView = getSeatView();
  const rejectedSeats = [];

  for (const seatId of seatIds) {
    const seatIndex = seatIdToIndex(seatId);
    const report = (action, result) => {
      logEvent({
        requestId: "you",
        seatId,
        action,
        result: typeof result === "number" ? seatStateName(result) : result,
        timestamp: performance.timeOrigin + performance.now(),
      });
    };

    const outcome = await attemptBooking(seatView, seatIndex, "fixed", report);
    report("outcome", outcome);
    if (outcome === "REJECTED") rejectedSeats.push(seatId);
  }

  if (rejectedSeats.length > 0) {
    alert(`These seats were taken before your booking went through: ${rejectedSeats.join(", ")}`);
  }

  clearSelection();
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
  popupEl.classList.add("hidden");
}

function handleRejectBooking() {
  clearSelection();
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
  popupEl.classList.add("hidden");
}

function resetEverything() {
  resetAllSeats();
  clearEventLog();
  clearSelection();
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
}

function readSimConfig() {
  const requestCount = Number(document.getElementById("sim-request-count").value);
  const selectedSeatIds = document
    .getElementById("sim-seat-ids").value
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  return { requestCount, selectedSeatIds };
}

function handleSimResult(result) {
  if (result.errors) {
    logEvent({ message: "Invalid input: " + result.errors.join(" ") });
    return;
  }

  const m = result.metrics;
  if (m.perSeat) {
    const summary = Object.entries(m.perSeat)
      .map(([seatId, s]) => `${seatId}: ${s.successes} booked, ${s.rejected} rejected`)
      .join(" | ");
    logEvent({ message: `Independent-seat result -- ${m.totalRequests} requests -- ${summary}` });
  } else {
    logEvent({
      message: `Result -- requests: ${m.totalRequests}, successful: ${m.successfulWrites}, rejected: ${m.rejectedCount}, duplicates: ${m.duplicateBookings}, race detected: ${m.raceDetected}`,
    });
  }

  refreshSeatDisplay(seatGridEl);
}

renderSeatGrid(seatGridEl, handleSeatClick);
updateConfirmButton();

document.getElementById("login-submit").onclick = () => {
  refreshSeatDisplay(seatGridEl);
  showPage("user-ui-page");
};
document.getElementById("nav-to-sim-from-landing").onclick = () => showPage("simulation-page");
document.getElementById("nav-to-sim-from-user-ui").onclick = () => showPage("simulation-page");
document.getElementById("nav-to-landing-from-sim").onclick = () => showPage("landing-page");
document.getElementById("nav-to-user-ui-from-sim").onclick = () => showPage("user-ui-page");

document.getElementById("logout").onclick = () => {
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  showPage("landing-page");
};
document.getElementById("reset-from-user-ui").onclick = resetEverything;
document.getElementById("reset-from-sim").onclick = resetEverything;

confirmBtn.onclick = () => {
  popupSeatListEl.textContent = "Seats: " + getSelectedSeats().join(", ");
  popupEl.classList.remove("hidden");
};
document.getElementById("confirm-booking-btn").onclick = handleConfirmBooking;
document.getElementById("reject-booking-btn").onclick = handleRejectBooking;

document.getElementById("run-unsafe-sim").onclick = () => {
  runRaceConditionSimulation({ ...readSimConfig(), mode: "unsafe" }, handleSimResult);
};
document.getElementById("run-fixed-sim").onclick = () => {
  runRaceConditionSimulation({ ...readSimConfig(), mode: "fixed" }, handleSimResult);
};
document.getElementById("run-independent-sim").onclick = () => {
  runIndependentSeatSimulation(readSimConfig(), handleSimResult);
};

showPage("landing-page");