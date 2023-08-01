/**
 * THIS is the SUMMARY MODULE (it lives at github.);
 * Generator to find all comment summaries with prefix set by 'textual_marker';
 * Tool that no longer uses the madge library.
 * //summary
 */

import dependencyTree, { Tree } from 'dependency-tree';
import fs, {Stats} from 'fs';
import path from 'path';
import walk from 'walkdir';
import { formatMs, timer, timer_model } from './util';
import { colors } from './colors'
import { countFileLines } from './file-io';

export type dependency_npm = {
    path: string;
    rel_path?: string;
    version?: string;
    package?: object | null;
}

export type dependency = {
    path: string;
    type?: string | null,
    rel_path?: string;
    deps?: string[];
    from?: string[];
    uses?: number;
    size?: number;
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
        obj.npm = {path:base_name, rel_path:package_json.name, version:package_json.version, package:package_json};
    }
}

const getAppRootDirFromPath = (p:string) => {
    let currentDir = p;
    while(!fs.existsSync(path.join(currentDir, 'package.json'))) {
        currentDir = path.join(currentDir, '..');
        if(currentDir === '/') return p;
    }
    return currentDir
}


const traverse_node = async (dep_path:string, obj:dependency) => {

    var line_count:number = await countFileLines(dep_path);

    obj.lines = line_count;
    const statsObj = fs.statSync(dep_path);
    obj.size = statsObj.size;
    obj.last_mod = statsObj.mtime;

    obj.path.indexOf('node_modules') !== -1 && validate_npm_module(obj);

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
            rel_path: short_path(dep_path),
            uses: 0,
            size: stat.size,
            deps: mixin.length > 0 ? mixin : [],
            from: from_path.length > 0 ? [from_path] : []
        };

        rm.set(dep_path, dep);
    }
}

var filterFn = function(directory:string, files:string[]){
    return files.filter((name) => {
        var test = !config.omit.includes(name);
        const ext = name.split('.');
        ext.length > 1 && (test = config.exts.includes('.'+ext.pop()))
        return test;
    });
}

const log = (msg:string) => `${colors.fg.magenta}${msg}${colors.reset}`;

const run_summary = async (target_path:string, configs:object = {}):Promise<object> => {

    process_timer.start();
    Object.assign(config, configs);

    base_path = getAppRootDirFromPath(target_path);
    console.log(log("Summary base_path"), base_path); 
    console.log(log("Config"), config); 

    rm.clear();
    
    const walk_opts = {
        "follow_symlinks": false,
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

