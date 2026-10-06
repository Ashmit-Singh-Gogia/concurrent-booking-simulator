import { showPage } from "./ui/page-router.js";
import { renderSeatGrid, refreshSeatDisplay } from "./ui/seat-grid.js";

const seatGridEl = document.getElementById("seat-grid");
renderSeatGrid(seatGridEl);

document.getElementById("login-submit").onclick = () => {
  refreshSeatDisplay(seatGridEl);
  showPage("user-page-ui");
};

document.getElementById("login-submit").onclick = () => showPage("user-ui-page"); // Currently we are not doing any login validation, so we just show the user-ui-page on clicking the login button.
document.getElementById("nav-to-sim-from-landing").onclick = () => showPage("simulation-page");
document.getElementById("nav-to-sim-from-user-ui").onclick = () => showPage("simulation-page");
document.getElementById("nav-to-landing-from-sim").onclick = () => showPage("landing-page");
document.getElementById("nav-to-user-ui-from-sim").onclick = () => showPage("user-ui-page");


document.getElementById("logout").onclick = () => {
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  showPage("landing-page");
};

showPage("landing-page");
