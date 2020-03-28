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
            const matched = x.match(/data:\s*\[[^\]]+\]?/);

            return [k, (matched && matched[0]) || ''];
        })
        .map(([k, x]) => {
            const matched = x.match(/\[.*\]/);
    
            return [k, matched && JSON.parse(matched[0])]
        });
    const {total, deaths, infected} = fromPairs(entries);
    const recovered = zip(total, deaths, infected).map(([x, y, z]) => x - y - z);

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