import {NowRequest, NowResponse} from '@now/node';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import {Map} from 'immutable';
import {fromPairs, zip} from 'lodash';


const extractData = (html: string): object => {
    const $ = cheerio.load(html);
    const res: string[] = [];
    const necessaryTitles = Map([
        ['Total Coronavirus Cases', 'total'],
        ['Total Deaths', 'deaths'],
        ['Currently Infected', 'infected']
    ]);
    const keys = necessaryTitles.keySeq().toSet();

    // should be just .text() but https://github.com/cheeriojs/cheerio/issues/1050
    $('script').each((_, elem) => res.push($(elem).html()!.toString()));

    const entries = res
        .map(x => {
            const key = keys.find(k => x.includes(k))

            return [key && necessaryTitles.get(key), x]; 
        })
        .filter((x): x is [string, string] => !!x[0])
        .map(([k, x]) => {
            const matchedData = x.match(/data:\s*\[[^\]]+\]?/);
            const matchedDays = x.match(/categories:\s*\[[^\]]+\]?/);
            const rawData = (matchedData && matchedData[0]) || '';
            const rawDays = (matchedDays && matchedDays[0]) || '';

            const data = rawData.match(/\[.*\]/);
            const days = rawDays.match(/\[.*\]/);

            const mapping = Map([
                ['Jan', 0],
                ['Feb', 1],
                ['Mar', 2],
                ['Apr', 3],
                ['May', 4],
                ['Jun', 5],
                ['Jul', 6],
                ['Aug', 7],
                ['Sep', 8],
                ['Oct', 9],
                ['Nov', 10],
                ['Dec', 11]
            ]);

            const jsData = (data && JSON.parse(data[0])) || [];
            const jsDays = ((days && JSON.parse(days[0])) || [])
                .map(x => x.split(' '))
                .map(([month, day]) => Date.UTC(2020, mapping.get(month)!, Number(day) + 1));


            return [k, zip(jsDays, jsData)];
        });
    const {total, deaths, infected} = fromPairs(entries);
    const recovered = zip(total, deaths, infected).map(([x, y, z]) => [x[0], x[1] - y[1] - z[1]]);

    return {
        total,
        recovered,
        dead: deaths
    };
};

export default async (req: NowRequest, res: NowResponse) => {
    const html = await fetch('https://www.worldometers.info/coronavirus', {})
        .then(res => res.text());

    res.json(extractData(html));
}