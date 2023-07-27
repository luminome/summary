"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = void 0;
const file_io_1 = require("./file-io");
const util_1 = require("./util");
const madge_1 = __importDefault(require("madge"));
const textual_marker = '--functional-summary';
const flattened = new Map();
const check = (path) => {
    const in_map = flattened.get(path);
    if (in_map === undefined) {
        const k = { path: path, uses: 1, bytes: 0, lines: 0, summary: 'blank' };
        flattened.set(path, k);
    }
    else {
        in_map.uses++;
    }
};
const filter = (src) => {
    Object.keys(src).map((path) => {
        check(path);
        src[path].map((sub_path) => {
            check(sub_path);
        });
    });
};
const read_summary = async (path) => {
    const map_el = flattened.get(path);
    const raw_read = await (0, file_io_1.read)(path);
    console.log(raw_read.message, raw_read.bytes_read, raw_read.num_lines);
    if (raw_read.payload) {
        const has_summary = raw_read.payload.indexOf(`//${textual_marker}`);
        map_el.bytes = !map_el.bytes ? raw_read.bytes_read : 0;
        map_el.lines = !map_el.lines ? raw_read.num_lines + 1 : 1;
        if (has_summary !== -1) {
            let text = raw_read.payload.slice(0, has_summary);
            map_el.summary = text;
        }
    }
    return map_el.summary;
};
const summary = (path, save_json) => {
    (0, madge_1.default)(path, { fileExtensions: ['ts', 'js'] }).then((res) => {
        console.log(res);
        filter(res.obj());
        const results = [];
        for (let [path, _] of flattened)
            results.push(read_summary(path));
        const indices = [...flattened.keys()];
        Promise.all(results).then(r => {
            r.map((summary, i) => {
                const map_el = flattened.get(indices[i]);
                summary = summary.replace('/*\n', '');
                summary = summary.replace('\n*/\n', '');
                map_el.summary = summary.split('\n');
            });
            console.log([...flattened]);
            save_json && (0, file_io_1.write)(save_json, JSON.stringify([...flattened.values()], null, 2));
        });
        return true;
    }).finally((r) => console.log('sync part done', r));
    return { result: null };
};
exports.summary = summary;
exports.default = (path, dom_obj, save_json = '') => {
    console.log((0, util_1.keyGen)(), path, dom_obj, __filename);
    path && (0, exports.summary)(path, save_json);
};
