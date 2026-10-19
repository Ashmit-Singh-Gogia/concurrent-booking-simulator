
var ia;
onmessage = function (ev) {

    const start = performance.now();


    ia = ev.data;
    ia[0] += 1;


    const end = performance.now();

    postMessage({
        start: start.toFixed(3),
        end: end.toFixed(3),
        duration: (end - start).toFixed(3)
    });
}