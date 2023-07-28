import nu_summary from "./index";
console.log('testing...');//,__filename);
import dependencyTree, { Tree, TreeInnerNode } from 'dependency-tree';
import fs, { Stats } from 'fs';
import path from 'path';
import { stringify } from "querystring";
import walk from 'walkdir';

// const content = fs.readFileSync('./src/index.ts', 'utf8');

// // Pass in a file's content or an AST
// const deps = precinct(content);
// console.log(deps);

export type dependency = {
    path: string,
    uses: number,
    bytes: number,
    lines: number,
    last_mod: number,
    summary: string | string[]
}


const no_ex:string[] = [];


// // const list = des({
// //     filename: './src/index.ts',
// //     directory: './src',
// //     tsConfig: "./tsconfig.json", // optional
// //     // noTypeDefinitions: true,
// //     nonExistent: no_ex,
// //     // noTypeDefinitions: true // optional
// // });

// console.log(list, no_ex);

// //return;

// const summary_data_store = {loaded:false, node_map:new Map, node_structure:{}};

// const summary = async () => {
//     const loaded_summary = await nu_summary('./', null, './records/a/record.json');
//     Object.assign(summary_data_store, loaded_summary);
//     console.log(summary_data_store.node_structure);
//     summary_data_store.loaded = true;
// }

// summary();

// console.log(summary_data_store.loaded);
// var walk = require('walkdir');

// async with path callback

// const base_path = './src';



// function walkDir(dir:string, callback:Function) {
//     fs.readdirSync(dir).forEach( f => {
//         let dirPath = path.join(dir, f);
//         let isDirectory = fs.statSync(dirPath).isDirectory();
//         isDirectory ? 
//         walkDir(dirPath, callback) : callback(path.join(dir, f));
//     });
// };


// walkDir('./', function(filePath:string) {
//     // const fileContents = fs.readFileSync(filePath, 'utf8');
//     console.log(filePath);//, fileContents);
// });

const filtered_omit = ['.vscode','.git','node_modules'];
const filtered_exts = ['.js','.ts','.json'];

const config = {
    omit: ['.vscode','.git','node_modules'],
    exts: ['.js','.ts','.json']
}

const flattened = new Map();


const short_path = (p:string) => p.substring(path.resolve('./').length, p.length);
const parse_path = (p:string, stat:Stats | any) => {
    stat.hasOwnProperty('mtime') && console.log(stat.mtime);

    const path_ = short_path(p);
    let fla = flattened.get(path_);
    
    if(!fla){
        flattened.set(path_,1);
    }else{
        flattened.set(path_,fla+1);
    }


    return path_
}


export const run_test = (base_path:string, dirPath:string, configs:object = {}) => {
    Object.assign(config, configs);
    const root = path.resolve('./');

    walk(base_path, function(path, stat) {
        // console.log(typeof stat);

        const omit = config.omit.filter(o => path.includes(o));
        const accept = config.exts.filter(o => path.includes(o));

        if(omit.length > 0 || accept.length === 0) return false;

        console.log('found: ', parse_path(path, stat));//, stat);
    
        const list:Tree = dependencyTree({
            filename: path,
            directory: base_path,
            tsConfig: "./tsconfig.json",
            nonExistent: no_ex,
            isListForm: false
            // nodeModulesConfig: {
            //     entry: 'module'
            // }, // optional
        });

        type ObjectKey = keyof typeof list;

        const k_path = path as ObjectKey;

        const krel = Object.entries(list).map(a => {
            return Object.keys(a[1]).map((path:string) => parse_path(path, {}));
        });

        // var array = Object.keys(list).map((k:string) =>{ return k });
        console.log(krel[0]);
        // console.log(flattened);
        // console.log(JSON.stringify(list, null, 2), no_ex);
    });

    // const list = dependencyTree({
    //     filename: path,
    //     directory: dirPath,
    //     tsConfig: "./tsconfig.json",
    //     nonExistent: no_ex,
    //     // nodeModulesConfig: {
    //     //     entry: 'module'
    //     // }, // optional
    // });

    // console.log(list, no_ex);
    
    
}

// console.log(path.resolve('./'));

// run_test('./', null);

