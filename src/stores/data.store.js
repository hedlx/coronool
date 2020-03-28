import {derived, readable} from 'svelte/store';


const data = readable({total: [], recovered: [], dead: []}, async set => {
    const response = await fetch(window.location.origin + '/api/get.data');
    const data = await response.json();

    set(data);

	return () => {};
});

const makeLastValues = field => derived(
    data,
    $data => $data[field]
        .reverse()
        .slice(0, 2)
);

const calcRate = values => {
    const [p, pp] = values;

    if (!p || !pp) {
        return;
    }

    return (p[1] - pp[1]) / (p[0] - pp[0]);
}

const calcTargetValue = (rate, lastVals, set) => {
    const [c] = lastVals;

    if (!c) {
        return () => {};
    }

    let inProgress = false;
    let lastDate = new Date().getTime();
    let currentCount = c[1] + (lastDate - c[0]) * rate;
    let roundedCount = Math.floor(currentCount);
    
    set(roundedCount);

    let timeoutID = null;
    const setCount = count => {
        timeoutID = setTimeout(() => {
            if (roundedCount < count) {
                roundedCount++;
                set(roundedCount);
                setCount(count);
            } else {
                inProgress = false;
            }
        }, 1000 * (Math.random() + 0.1))
    };

    const intervalID = setInterval(() => {
        const rand = Math.random();
        if (rand >= 0.5 || inProgress) {
            return;
        }

        const curDate = new Date().getTime();
        currentCount += (curDate - lastDate) * rate;

        const diff = Math.floor(currentCount - roundedCount);

        if (diff >= 1) {
            inProgress = true;
            setCount(roundedCount + diff);
            lastDate = curDate;
        }
    }, 1 / rate);

    return () => {
        clearInterval(intervalID);
        clearTimeout(timeoutID);
    };
};

const lastTotals = makeLastValues('total');
const totalRate = derived(
    lastTotals,
    $totals => calcRate($totals)
);

export const total = derived(
    [totalRate, lastTotals],
    ([$totalRate, $lastTotals], set) => calcTargetValue($totalRate, $lastTotals, set)
);

const lastRecovereds = makeLastValues('recovered');
const recoveredRate = derived(
    lastRecovereds,
    $lastRecovereds => calcRate($lastRecovereds)
);

export const recovered = derived(
    [recoveredRate, lastRecovereds],
    ([$recoveredRate, $lastRecovereds], set) => calcTargetValue($recoveredRate, $lastRecovereds, set)
);


const lastDeaths = makeLastValues('dead');
const deathRate = derived(
    lastDeaths,
    $lastDeaths => calcRate($lastDeaths)
);

export const dead = derived(
    [deathRate, lastDeaths],
    ([$deathRate, $lastDeaths], set) => calcTargetValue($deathRate, $lastDeaths, set)
);

export const actual = derived(
    [total, recovered, dead],
    ([$total, $recovered, $dead]) => $total && $recovered && $dead
        ? $total - $recovered - $dead
        : undefined
);
