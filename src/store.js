import {derived, readable} from 'svelte/store';

const apiURL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/cases_time_v3/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Report_Date_String%20desc&outSR=102100&resultOffset=0&resultRecordCount=3&cacheHint=true";
const deadURL = "https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Deaths%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&outSR=102100&cacheHint=true"

const data = readable({features: []}, async set => {
    const response = await fetch(apiURL, {
        "credentials": "omit",
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.arcgis.com/apps/opsdashboard/index.html",
        "referrerPolicy": "no-referrer-when-downgrade",
        "method": "GET",
        "mode": "cors"
    });
    const data = await response.json();

    set(data);

	return () => {};
});

const makeLastValues = field => derived(
    data,
    $data => $data
        .features
        .map(x => x.attributes)
        .map(x => [x['Report_Date'], x[field]])
);

const calcRate = values => {
    const [, p, pp] = values;

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

const lastTotals = makeLastValues('Total_Confirmed');
const totalRate = derived(
    lastTotals,
    $totals => calcRate($totals)
);

export const total = derived(
    [totalRate, lastTotals],
    ([$totalRate, $lastTotals], set) => calcTargetValue($totalRate, $lastTotals, set)
);

const lastRecovereds = makeLastValues('Total_Recovered');
const recoveredRate = derived(
    lastRecovereds,
    $lastRecovereds => calcRate($lastRecovereds)
);

export const recovered = derived(
    [recoveredRate, lastRecovereds],
    ([$recoveredRate, $lastRecovereds], set) => calcTargetValue($recoveredRate, $lastRecovereds, set)
);

export const dead = readable(null, async set => {
    const response = await fetch(
        deadURL,
        {
            "credentials": "omit",
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ru;q=0.8",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html",
            "referrerPolicy": "no-referrer-when-downgrade",
            "mode":"cors"
        });

    const data = await response.json();

    set(data.features[0].attributes.value)
});

export const actual = derived(
    [total, recovered, dead],
    ([$total, $recovered, $dead]) => $total && $recovered && $dead
        ? $total - $recovered - $dead
        : undefined
);
