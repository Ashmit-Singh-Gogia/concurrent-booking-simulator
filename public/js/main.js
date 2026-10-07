import { showPage } from "./ui/page-router.js";
import { renderSeatGrid, refreshSeatDisplay } from "./ui/seat-grid.js";
import { toggleSeatSelection, getSelectedSeats } from "./ui/seat-selection.js";
import { getSeatState } from "./core/shared-state.js";
import { seatIdToIndex } from "./core/seat-model.js";
import { SEAT_STATE } from "./core/constants.js";

const seatGridEl = document.getElementById("seat-grid");
const confirmBtn = document.getElementById("confirm-selection");

function updateConfirmButton() {
  confirmBtn.disabled = getSelectedSeats().length == 0;
}

function handleSeatClick(seatId) {
  const state = getSeatState(seatIdToIndex(seatId));
  if (state != SEAT_STATE.AVAILABLE) return;

  const resullt = toggleSeatSelection(seatId);
  if (!resullt.changed) {
    alert(resullt.changed);
    return;
  }
  refreshSeatDisplay(seatGridEl);
  updateConfirmButton();
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

confirmBtn.onclick = () => {
  console.log("Confirmed selection:", getSelectedSeats()); // the popup itself is next chunk
};


showPage("landing-page");
