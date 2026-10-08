import { showPage } from "./ui/page-router.js";
import { renderSeatGrid, refreshSeatDisplay } from "./ui/seat-grid.js";
import { toggleSeatSelection, getSelectedSeats, clearSelection } from "./ui/seat-selection.js";
import { getSeatState, getSeatView } from "./core/shared-state.js";
import { seatIdToIndex } from "./core/seat-model.js";
import { SEAT_STATE, seatStateName } from "./core/constants.js";
import { attemptBooking } from "./core/booking-engine.js";


const seatGridEl = document.getElementById("seat-grid");
const confirmBtn = document.getElementById("confirm-selection");
const popupEl = document.getElementById("booking-popup");
const popupSeatListEl = document.getElementById("popup-seat-list");

function updateConfirmButton() {
  confirmBtn.disabled = getSelectedSeats().length == 0;
}

function handleSeatClick(seatId) {
  const state = getSeatState(seatIdToIndex(seatId));
  if (state !== SEAT_STATE.AVAILABLE) return;

  const resullt = toggleSeatSelection(seatId);
  if (!resullt.changed) {
    alert(resullt.changed);
    return;
  }
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
}


function handleConfirmBooking() {
  const seatIds = getSelectedSeats();
  const seatView = getSeatView();
  const rejectedSeats = [];

  for (const seatId of seatIds) {
    const seatIndex = seatIdToIndex(seatId);
    const report = (action, result) => {
      console.log(`[booking] ${seatId} ${action} -> ${typeof result === "number" ? seatStateName(result) : result}`);
      // this is where we connect the event log
    };

    const outcome = attemptBooking(seatView, seatIndex, "fixed", report);
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
document.getElementById("confirm-booking-btn").onclick = handleConfirmBooking;
document.getElementById("reject-booking-btn").onclick = handleRejectBooking;

confirmBtn.onclick = () => {
  popupSeatListEl.textContent = "Seats: " + getSelectedSeats().join(", ");
  popupEl.classList.remove("hidden");
};

showPage("landing-page");
