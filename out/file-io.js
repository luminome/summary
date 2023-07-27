import { promises as fs } from 'fs';
import * as fs_s from 'fs';
import { formatBytes } from './util';
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
export const write = async (path, data) => {
    try {
        await fs.writeFile(path, data, { flag: 'w+' });
        return `file ${path} (${formatBytes(getBytes(data))}) was saved.`;
    }
    catch (error) {
        return `file write failed (${error})`;
    }
};
export const read = async (path) => {
    try {
        const data = await fs.readFile(path);
        return { message: `read ${path} (${formatBytes(getBytes(data.toString()))}).`,
            bytes_read: getBytes(data.toString()),
            num_lines: await countFileLines(path),
            payload: data.toString() };
    }
    catch (error) {
        return { message: `file read failed (${error})`, bytes_read: 0, num_lines: null, payload: null };
    }
};
