import nu_summary from "./index";
console.log('testing',__filename);
import dependencyTree from 'dependency-tree';
import fs from 'fs';
import precinct from 'precinct';

// const content = fs.readFileSync('./src/index.ts', 'utf8');

// // Pass in a file's content or an AST
// const deps = precinct(content);
// console.log(deps);



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

export const run_test = (path:string) => {


    const list = dependencyTree({
        filename: path,
        directory: __dirname,
        tsConfig: "./tsconfig.json",
        nonExistent: no_ex,
        // nodeModulesConfig: {
        //     entry: 'module'
        // }, // optional
    });

    console.log(list, no_ex);
    
}
