/*
THIS is the SUMMARY MODULE (it lives at github.);
Generator to find all comment summaries with prefix set by 'textual_marker';
It's a pretty remarkable little tool that uses the madge library.
*/
//--functional-summary
import { read, write } from './file-io';
import { keyGen } from './util';
import madge from 'madge';

const textual_marker = '--functional-summary';

export type dependency = {
    path: string,
    uses: number,
    bytes: number,
    lines: number,
    last_mod: number,
    summary: string | string[]
}

// var flat:dependency[];
const flattened = new Map();

const check = (path:string):void => {
    const in_map = flattened.get(path);
    if(in_map === undefined){
        const k:dependency = {path:path, uses:1, bytes:0, lines:0, last_mod:0, summary: 'blank'};
        flattened.set(path, k);
    }else{
        in_map.uses ++;
    }
}

const filter = (src:any):void => {
    Object.keys(src).map((path:string) => {
        check(path);
        src[path].map((sub_path:string) =>{
            check(sub_path);
        })
    });
}

const read_summary = async (path:string): Promise<string> => {
    const map_el = flattened.get(path);
    const raw_read = await read(path);
    console.log(raw_read.message, raw_read.bytes_read, raw_read.num_lines);

    if(raw_read.payload){
        const has_summary = raw_read.payload.indexOf(`//${textual_marker}`);

        map_el.bytes = !map_el.bytes ? raw_read.bytes_read : 0;
        map_el.lines = !map_el.lines ? raw_read.num_lines+1 : 1;
        map_el.last_mod = !map_el.last_mod ? raw_read.stat : null;

        if(has_summary !== -1){
            let text:string = raw_read.payload.slice(0,has_summary);
            map_el.summary = text;
        }
    }

    return map_el.summary;
}

export const summary = async (path:string, save_json:string):Promise<object> => {
    
    const products = await madge(path, {fileExtensions:['ts', 'js'], includeNpm:true}).then(res => {
        filter(res.obj());
        const results:Promise<string>[] = [];
        for(let [path, _] of flattened) results.push(read_summary(path));
        
        const indices:Array<string> = [...flattened.keys()];

        Promise.all(results).then(r => {
            r.map((summary:string, i:number) => {
                const map_el = flattened.get(indices[i]);
                summary = summary.replace('/*\n','');
                summary = summary.replace('\n*/\n','');
                map_el.summary = summary.split('\n');
            });
            // console.log([...flattened]);
            // console.log([...flattened.values()]);
            save_json && write(
                save_json, 
                JSON.stringify([...flattened.values()], null, 2)
            );
            console.log('async part done');
        });
        
        return {node_map: Object.fromEntries(flattened.entries()), node_structure:{obj:res.obj(), warnings:res.warnings()}};

    }).finally((r:void) => console.log('sync part done', r));

    return products;
}
        



export default async (path:string | null, dom_obj:HTMLDivElement | null, save_json:string = ''):Promise<object> => {
    console.log(keyGen(), path, dom_obj, __filename);
    return path && summary(path, save_json);
}