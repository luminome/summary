/**
 * THIS is the SUMMARY MODULE (it lives at github.);
 * Generator to find all comment summaries with prefix set by 'textual_marker';
 * Tool that no longer uses the madge library.
 * //summary
 */

// console.log('summary init...',__filename);

import dependencyTree, { Tree } from 'dependency-tree';
import fs, {Stats} from 'fs';
import path from 'path';
import walk from 'walkdir';
import { formatMs, timer, timer_model } from './util';

import { colours } from './colors'
import { countFileLines } from './file-io';

export type dependency_npm = {
    path: string;
    path_rel?: string;
    version?: string;
    package?: object | null;
}

export type dependency = {
    path: string;
    type?: string | null,
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

const process_timer = timer('process_timer');
process_timer.start();

const no_ex:string[] = [];
const wkg_root = path.resolve('./');
var base_path:string = null;

const rm = new Map();

const config = {
    omit: ['.','..','.vscode','.git','node_modules'],
    exts: ['.js','.ts','.json'],
    summary_marker: `//${'summary'}`,
}

const short_path = (p:string) => p.substring(base_path.length, p.length);

const compare = (a:any, b:any) => {
    const d = b[1].deps.length - a[1].deps.length;
    const an = a[1].npm ? 1 : 0;
    const bn = b[1].npm ? 1 : 0;
    return bn - an || d;
};


const validate_npm_module = (obj:dependency) => {
    const base_name = getAppRootDirFromPath(obj.path);
    const package_path = path.join(base_name, 'package.json');
    if(fs.existsSync(package_path)){
        const package_json = JSON.parse(fs.readFileSync(package_path, 'utf8'));
        const term = base_name.split('/').pop();
        obj.npm = {path:base_name, path_rel:term, version:package_json.version, package:package_json};
    }
}

const getAppRootDirFromPath = (p:string) => {
    //find enclosing with 'package.json';
    // p.indexOf('.') !== -1 && 
    const base = p.indexOf('.') !== -1 ? p.replace(/\/?[^\/]+\.[a-z]+|\/$/g, '') : p;
    let currentDir = base;
    while(!fs.existsSync(path.join(currentDir, 'package.json'))) {
        currentDir = path.join(currentDir, '..');
        if(currentDir === '/') return base;
    }
    return currentDir
}



const traverse_node = async (dep_path:string, obj:dependency) => {

    // console.log('dep_path', `${dep_path}`, obj);
    var line_count:number = await countFileLines(dep_path);

    // try {
    //     line_count = await countFileLines(dep_path);
    // } catch (err) {
    //     console.error(err);
    // }

    // console.log(dep_path, line_count);
    // try {
    //     line_count = obj.type === 'directory' && await countFileLines(dep_path);
    // } catch (err) {
    //     console.log('dep_path', `${dep_path}`);
    //     console.error(err);
    // }

    // console.log(line_count);
    // return false;

    obj.lines = line_count;
    const statsObj = fs.statSync(dep_path);
    obj.bytes = statsObj.size;
    obj.last_mod = statsObj.mtime;

    // validate info for npm packages.
    // console.log(obj.path);
    obj.path.indexOf('node_modules') !== -1 && validate_npm_module(obj);

    
    // obj.path_rel?.length > 0 && obj.path_rel.indexOf('node_modules') !== -1 && validate_npm_module(obj);
    
    // get summaries if they exist.
    // this is some terrible regex.
    const regex = /\/\*\*\n|\s\*\s|\*\s|\/\/.[a-z]+|\n\s\*\/|\n\*\//g;

    try {
        if(!obj.validated && obj.path.indexOf('.json') === -1){
            const data = fs.readFileSync(dep_path, 'utf8');
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

const create_dependency = (dep_path:string, type:string, stat:Stats, from_path:string = '', mixin:string[] = []):void => {

    const obj = rm.get(dep_path);

    if(obj){
        obj.uses ++;
        from_path.length > 0 && obj.from.push(from_path);
    }else{

        const dep:dependency = {
            path: dep_path,
            type: type,
            path_rel: short_path(dep_path),
            uses: 0,
            bytes: stat.size,
            deps: mixin.length > 0 ? mixin : [],
            from: from_path.length > 0 ? [from_path] : []
        };

        rm.set(dep_path, dep);
    }
}

var filterFn = function(directory:string, files:string[]){
    // console.log('directory', directory, files);
    return files.filter((name) => {
        var test = !config.omit.includes(name);
        const ext = name.split('.');
        ext.length > 1 && (test = config.exts.includes('.'+ext.pop()))
        return test;
    });
}

const log = (msg:string) => `${colours.fg.magenta}${msg}${colours.reset}`;

const run_summary = async (target_path:string, configs:object = {}):Promise<object> => {
    /**
     * now we must locate the enclosing project directory.
     */
    process_timer.start();
    Object.assign(config, configs);

    base_path = getAppRootDirFromPath(target_path);
    console.log(log("Summary base_path"), base_path); 
    console.log(log("Config"), config); 

    

    rm.clear();
    
    const walk_opts = {
        "follow_symlinks": true,
        "filter" : filterFn
    }


    walk.sync(target_path, walk_opts, (path, stat) => {

        if(!stat.isFile()) return;

        const list:Tree = dependencyTree({
            filename: path,
            directory: base_path,
            tsConfig: "./tsconfig.json",
            nonExistent: no_ex,
            isListForm: false
        });

        const krel = Object.entries(list).map((a) => {
            return Object.keys(a[1]).map((dep_path:string) => {
                create_dependency(dep_path, 'file', stat, path);
                return dep_path;
            });
        });

        const node_type = stat.isFile() ? 'file' : 'directory';
        create_dependency(path, node_type, stat, '');


    });

    console.log(log("Summary base_path walked.")); 

    const pref = [...rm.entries()].map(m => traverse_node(m[0], m[1]));
    await Promise.all(pref);

    console.log(log(`Summary all nodes traversed. (${pref.length})items`)); 
    const pref_sort = [...rm.entries()].sort(compare).map((v:any) => {
        return {fs_node:v[1]};
    });
    
    console.log(log(`${formatMs(process_timer.stop())} elapsed.`)); 

    return [{message: ['summary', pref_sort.length, 'tested'], children: pref_sort}];
}


export {run_summary as default};


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
