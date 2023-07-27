"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = exports.write = void 0;
const fs_1 = require("fs");
const fs_s = __importStar(require("fs"));
const util_1 = require("./util");
const getBytes = (data) => Number(new TextEncoder().encode(data).length);
function countFileLines(filePath) {
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        fs_s.createReadStream(filePath)
            .on("data", (buffer) => {
            let idx = -1;
            lineCount--;
            do {
                idx = buffer.indexOf(10, idx + 1);
                lineCount++;
            } while (idx !== -1);
        }).on("end", () => {
            resolve(lineCount);
        }).on("error", reject);
    });
}
;
const write = async (path, data) => {
    try {
        await fs_1.promises.writeFile(path, data, { flag: 'w+' });
        return `file ${path} (${(0, util_1.formatBytes)(getBytes(data))}) was saved.`;
    }
    catch (error) {
        return `file write failed (${error})`;
    }
};
exports.write = write;
const read = async (path) => {
    try {
        const data = await fs_1.promises.readFile(path);
        return { message: `read ${path} (${(0, util_1.formatBytes)(getBytes(data.toString()))}).`,
            bytes_read: getBytes(data.toString()),
            num_lines: await countFileLines(path),
            payload: data.toString() };
    }
    catch (error) {
        return { message: `file read failed (${error})`, bytes_read: 0, num_lines: null, payload: null };
    }
};
exports.read = read;
