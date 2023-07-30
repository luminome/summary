/**
* want to have it in d.ts
* will need to match against \/\*\*\s*\n([^\*]|\*[^\/])*\*\/
* TODO: add filter for /node_modules/
* //summary
*/

import summary from './index';

summary('/Users/sac/Projects/module/summary/src/index.ts').then((res) => console.log(JSON.stringify(res, null, 2)));


// console.log('summary init...',__filename);

// import dependencyTree, { Tree, TreeInnerNode } from 'dependency-tree';
// import fs, { Stats } from 'fs';
// import path from 'path';
// import walk from 'walkdir';
// import { countFileLines } from './file-io';

// export type dependency_npm = {
//     path: string;
//     path_rel?: string;
//     version?: string;
//     package?: object | null;
// }

// export type dependency = {
//     path: string;
//     path_rel?: string;
//     deps?: string[];
//     from?: string[];
//     uses?: number;
//     bytes?: number;
//     lines?: number;
//     last_mod?: Date;
//     validated?: boolean;
//     npm?: dependency_npm | null;
//     summary?: string | string[] | null;
// }

// const no_ex:string[] = [];
// const wkg_root = path.resolve('./');
// const rm = new Map();

// const config = {
//     omit: ['.vscode','.git','node_modules'],
//     exts: ['.js','.ts','.json'],
//     summary_marker: `//${'summary'}`,
// }

// const short_path = (p:string) => p.substring(path.resolve('./').length, p.length);
// const compare = (a:any, b:any) => {
//     const d = b[1].deps.length - a[1].deps.length;
//     const an = a[1].npm ? 1 : 0;
//     const bn = b[1].npm ? 1 : 0;
//     return bn - an || d;
// };


// const validate_npm_module = (obj:dependency) => {
//     const ref = obj.path_rel.split('/');
//     const name = ref[2].indexOf('@') === -1 ? ref[2] : `${ref[2]}/${ref[3]}`;
//     const package_path = `${wkg_root}/node_modules/${name}/package.json`;
//     const package_json = JSON.parse(fs.readFileSync(package_path, 'utf8'));
//     const npm_dep:dependency_npm = {path:`${wkg_root}/node_modules/${name}`, path_rel:name, version:package_json.version, package:package_json};
//     obj.npm = npm_dep;
// }

// const traverse_node = async (path:string, obj:dependency) => {
//     const plines = await countFileLines(path);
//     obj.lines = (plines as number);
//     const statsObj = fs.statSync(path);
//     obj.bytes = statsObj.size;
//     obj.last_mod = statsObj.mtime;

//     // validate info for npm packages.
//     obj.path_rel?.length > 0 && obj.path_rel.indexOf('node_modules') !== -1 && validate_npm_module(obj);
    
//     // get summaries if they exist.
//     // this is some terrible regex.
//     const regex = /\/\*\*\n|\*\s|\/\/.[a-z]+|\n\*\/\n/g;

//     try {
//         if(!obj.validated){
//             const data = fs.readFileSync(path, 'utf8');
//             var m = data.match(/\/\*\*\s*\n([^\*]|\*[^\/])*\*\/\n/g);
//             const summary = m && m.filter((e:string) => e.indexOf(config.summary_marker) !== -1)
//                 .map((e:string) => e.replace(regex,'').split('\n').filter((e:string) => e.length > 0));
//             obj.summary = (summary as []);
//             obj.validated = true;
//         }
//     } catch (err) {
//         console.error(err);
//     }

// }

// const create_dependency = (path:string, from_path:string = '', mixin:string[] = []) => {
//     const obj = rm.get(path);
//     if(obj){
//         obj.uses ++;
//         from_path.length > 0 && obj.from.push(from_path);
//     }else{
//         const dep:dependency = {path: path, path_rel: short_path(path), uses: 0, deps: mixin.length > 0 ? mixin : [], from: from_path.length > 0 ? [from_path] : []};
//         rm.set(path, dep);
//     }
// }



// export const run_test = async (base_path:string, dirPath:string, configs:object = {}) => {
//     Object.assign(config, configs);

//     walk.sync(base_path, (path, _) => {
//         const omit = config.omit.filter(o => path.includes(o));
//         const accept = config.exts.filter(o => path.includes(o));
//         if(omit.length > 0 || accept.length === 0) return false;

//         const list:Tree = dependencyTree({
//             filename: path,
//             directory: base_path,
//             tsConfig: "./tsconfig.json",
//             nonExistent: no_ex,
//             isListForm: false
//         });

//         const krel = Object.entries(list).map((a) => {
//             return Object.keys(a[1]).map((dep_path:string) => {
//                 create_dependency(dep_path, path);
//                 return dep_path;
//             });
//         });

//         create_dependency(path, '', krel[0]);
//     });

//     const pref = [...rm.entries()].map(m => traverse_node(m[0], m[1]));
//     await Promise.all(pref);

//     const sledge:any = {};
//     const pref_sort = [...rm.entries()].sort(compare).map((v:any) => {
//         sledge[v[0] as keyof any] = v[1];
//     });
//     return sledge;
// }

// run_test('./', null);

