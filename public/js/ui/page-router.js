const PAGE_IDS = ["landing-page" , "user-ui-page" , "simulation-page"]

export function showPage(pageId) {
    PAGE_IDS.forEach((id) => {
        document.getElementById(id).classList.toggle("hidden" , id != pageId);
    });
}
