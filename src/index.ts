/*
THIS is the SUMMARY MODULE (npm link);
Generator to find all comment summaries with prefix set by 'textual_marker';
It's a pretty remarkable little tool the uses the madge library.
*/
//--functional-summary

import { read, write } from './file-io.ts';
import { keyGen } from './util.ts';
import madge from 'madge';

const textual_marker = '--functional-summary';

type dependency = {
    path: string,
    uses: number,
    bytes: number,
    lines: number,
    summary: string | string[]
}

// var flat:dependency[];
const flattened = new Map();

const check = (path:string):void => {
    const in_map = flattened.get(path);
    if(in_map === undefined){
        const k:dependency = {path:path, uses:1, bytes:0, lines:0, summary: 'blank'};
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

        if(has_summary !== -1){
            let text:string = raw_read.payload.slice(0,has_summary);
            map_el.summary = text;
        }
    }

    return map_el.summary;
}

export const summary = (path:string, save_json:string):object => {
    madge(path, {fileExtensions:['ts', 'js']}).then((res) => {
        console.log(res);
        
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
            console.log([...flattened]);
            // console.log([...flattened.values()]);
            save_json && write(
                save_json, 
                JSON.stringify([...flattened.values()], null, 2)
            );
        });
        
        return true;
    }).finally((r:void) => console.log('sync part done', r));

    return {result:null};
}
        



export default (path:string | null, dom_obj:HTMLDivElement | null, save_json:string = ''):void => {
    console.log(keyGen(), path, dom_obj, __filename);
    
    path && summary(path, save_json);




    

}