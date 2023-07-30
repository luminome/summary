/**
 * THIS is the SUMMARY MODULE (it lives at github.);
 * Generator to find all comment summaries with prefix set by 'textual_marker';
 * Tool that no longer uses the madge library.
 * //summary
 */

// console.log('summary init...',__filename);

import dependencyTree, { Tree } from 'dependency-tree';
import fs from 'fs';
import path from 'path';
import walk from 'walkdir';
import { countFileLines } from './file-io';

export type dependency_npm = {
    path: string;
    path_rel?: string;
    version?: string;
    package?: object | null;
}

export type dependency = {
    path: string;
    path_rel?: string;
    deps?: string[];
    from?: string[];
    uses?: number;
    bytes?: number;
    lines?: number;
    last_mod?: Date;
    validated?: boolean;
    npm?: dependency_npm | null;
    summary?: string[] | null;
}

const no_ex:string[] = [];
const wkg_root = path.resolve('./');
const rm = new Map();

const config = {
    omit: ['.vscode','.git','node_modules'],
    exts: ['.js','.ts','.json'],
    summary_marker: `//${'summary'}`,
}

const short_path = (p:string) => p.substring(path.resolve('./').length, p.length);
const compare = (a:any, b:any) => {
    const d = b[1].deps.length - a[1].deps.length;
    const an = a[1].npm ? 1 : 0;
    const bn = b[1].npm ? 1 : 0;
    return bn - an || d;
};


const validate_npm_module = (obj:dependency) => {
    const ref = obj.path_rel.split('/');
    const name = ref[2].indexOf('@') === -1 ? ref[2] : `${ref[2]}/${ref[3]}`;
    const package_path = `${wkg_root}/node_modules/${name}/package.json`;
    const package_json = JSON.parse(fs.readFileSync(package_path, 'utf8'));
    const npm_dep:dependency_npm = {path:`${wkg_root}/node_modules/${name}`, path_rel:name, version:package_json.version, package:package_json};
    obj.npm = npm_dep;
}

const traverse_node = async (path:string, obj:dependency) => {
    const plines = await countFileLines(path);
    obj.lines = (plines as number);
    const statsObj = fs.statSync(path);
    obj.bytes = statsObj.size;
    obj.last_mod = statsObj.mtime;

    // validate info for npm packages.
    obj.path_rel?.length > 0 && obj.path_rel.indexOf('node_modules') !== -1 && validate_npm_module(obj);
    
    // get summaries if they exist.
    // this is some terrible regex.
    const regex = /\/\*\*\n|\s\*\s|\*\s|\/\/.[a-z]+|\n\s\*\/|\n\*\//g;

    try {
        if(!obj.validated){
            const data = fs.readFileSync(path, 'utf8');
            var m = data.match(/\/\*\*\s*\n([^\*]|\*[^\/])*\*\/\n/g);
            const summary = m && m.filter((e:string) => e.indexOf(config.summary_marker) !== -1)
                .map((e:string) => e.replace(regex,'').split('\n').filter((e:string) => e.length > 0));
            obj.summary = summary as [];//(summary as []);
            obj.validated = true;
        }
    } catch (err) {
        console.error(err);
    }

}

const create_dependency = (path:string, from_path:string = '', mixin:string[] = []) => {
    const obj = rm.get(path);
    if(obj){
        obj.uses ++;
        from_path.length > 0 && obj.from.push(from_path);
    }else{
        const dep:dependency = {path: path, path_rel: short_path(path), uses: 0, deps: mixin.length > 0 ? mixin : [], from: from_path.length > 0 ? [from_path] : []};
        rm.set(path, dep);
    }
}

const test = async (base_path:string, configs:object = {}):Promise<object> => {
    Object.assign(config, configs);
    rm.clear();
    

    walk.sync(base_path, (path, _) => {
        const omit = config.omit.filter(o => path.includes(o));
        const accept = config.exts.filter(o => path.includes(o));
        if(omit.length > 0 || accept.length === 0) return false;
        
        console.log(base_path, path);

        const list:Tree = dependencyTree({
            filename: path,
            directory: base_path,
            tsConfig: "./tsconfig.json",
            nonExistent: no_ex,
            isListForm: false
        });

        const krel = Object.entries(list).map((a) => {
            return Object.keys(a[1]).map((dep_path:string) => {
                create_dependency(dep_path, path);
                return dep_path;
            });
        });

        create_dependency(path, '', krel[0]);
    });

    const pref = [...rm.entries()].map(m => traverse_node(m[0], m[1]));
    await Promise.all(pref);

    // console.log(pref);
    // const sledge:any = {};
    const pref_sort = [...rm.entries()].sort(compare).map((v:any) => {
        return {fs_node:v[1]};
    });
    
    // console.log(pref_sort);

    return [{message: ['summary', pref_sort.length, 'tested'], children: pref_sort}];
}


export {test as default};


// default('./', null);



// import { read, write } from './file-io';
// import { keyGen } from './util';
// import madge, { MadgeConfig } from 'madge';
// import dotenv from 'dotenv';

// dotenv.config();

// const textual_marker = '--summary';

// const no_ex:string[] = [];
// // const madge_config:MadgeConfig = {
// //     fileExtensions: ["ts", "js"], 
// //     includeNpm: true,
// //     // tsConfig: "./tsconfig.json",
// //     // detectiveOptions: {
// //     //     ts:{
// //     //         mixedImports: true,
// //     //         includeCore: true,
// //     //         skipTypeImports: true
// //     //     },
// //     //     js:{
// //     //         includeCore: true,
// //     //     }
// //     //     // includeCore: true,
// //     //     // tsConfig: "./tsconfig.json",
// //     //     // // "mixedImports": true,
// //     //     // // "includeCore": true,
// //     //     // // "nodeModulesConfig": {
// //     //     // //     "entry": "module"
// //     //     // // }, // optional
// //     //     // nonExistent: no_ex,
// // 	// },

// // }

// const madge_config:MadgeConfig = {
//     "includeNpm": true,
//     "detectiveOptions": {
//         "ts": {
//             "skipTypeImports": false
//         }
//     },
//     "baseDir": "./",
//     "fileExtensions": [
//         "ts", "js"
//     ],
//     "tsConfig": "./tsconfig.json"
// }

// export type dependency = {
//     path: string,
//     uses: number,
//     bytes: number,
//     lines: number,
//     last_mod: number,
//     summary: string | string[]
// }

// // var flat:dependency[];
// const flattened = new Map();

// const check = (path:string):void => {
//     const in_map = flattened.get(path);
//     if(in_map === undefined){
//         const k:dependency = {path:path, uses:1, bytes:0, lines:0, last_mod:0, summary: 'blank'};
//         flattened.set(path, k);
//     }else{
//         in_map.uses ++;
//     }
// }

// const filter = (src:any):void => {
//     Object.keys(src).map((path:string) => {
//         check(path);
//         src[path].map((sub_path:string) =>{
//             check(sub_path);
//         })
//     });
// }

// const read_summary = async (path:string): Promise<string> => {
//     const map_el = flattened.get(path);
//     const raw_read = await read(path);
//     console.log(raw_read.message, raw_read.bytes_read, raw_read.num_lines);

//     if(raw_read.payload){
//         const has_summary = raw_read.payload.indexOf(`//${textual_marker}`);

//         map_el.bytes = !map_el.bytes ? raw_read.bytes_read : 0;
//         map_el.lines = !map_el.lines ? raw_read.num_lines+1 : 1;
//         map_el.last_mod = !map_el.last_mod ? raw_read.stat : null;

//         if(has_summary !== -1){
//             let text:string = raw_read.payload.slice(0,has_summary);
//             map_el.summary = text;
//         }
//     }

//     return map_el.summary;
// }

// export const summary = async (path:string, save_json:string):Promise<object> => {

//     console.log(madge_config);
    

//     const products = await madge(path, madge_config).then(res => {
//         console.log('dep', res.depends('src/file-io.ts'));


//         filter(res.obj());
//         const results:Promise<string>[] = [];
//         for(let [path, _] of flattened) results.push(read_summary(path));
        
//         const indices:Array<string> = [...flattened.keys()];

//         Promise.all(results).then(r => {
//             r.map((summary:string, i:number) => {
//                 const map_el = flattened.get(indices[i]);
//                 summary = summary.replace('/*\n','');
//                 summary = summary.replace('\n*/\n','');
//                 map_el.summary = summary.split('\n');
//             });
//             // console.log([...flattened]);
//             // console.log([...flattened.values()]);
//             save_json && write(
//                 save_json, 
//                 JSON.stringify([...flattened.values()], null, 2)
//             );
//             console.log('async part done');
//         });
        
//         return {node_map: Object.fromEntries(flattened.entries()), node_structure:{obj:res.obj(), warnings:res.warnings()}};

//     }).finally((r:void) => console.log('sync part done', r));

//     return products;
// }
        



// export default async (path:string | null, dom_obj:HTMLDivElement | null, save_json:string = ''):Promise<object> => {
//     console.log(keyGen(), path, dom_obj, __filename);
//     return path && summary(path, save_json);
// }

/**
* This is the official version.
* //summary
*/

/**
 * This is the un-official version.
 * //summary
 */
//text
