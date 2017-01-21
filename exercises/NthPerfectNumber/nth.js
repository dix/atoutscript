//
// Finds the Nth perfect number (sum of digits = 10)
//
// # Run :
// $> node nth.js n
// # Example :
// $> node nth.js 2
// $> 28
//
const crit = process.argv[2];

let cur = 19;
let curId = 1;

while (curId <= crit) {
    if (10 == [...cur + ''].map(o => +o).reduce((p, q) => p + q)) {
        if (curId == crit) {
            console.info(cur);
            process.exit();
        }
        curId++;
    }
    cur++;
}