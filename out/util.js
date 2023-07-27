"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyGen = exports.formatBytes = exports.formatMs = void 0;
function formatMs(ms, decimals = 3) {
    if (!+ms)
        return '0 ms';
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['ms', 's', 'm', 'h'];
    const scales = [1, 1000, 60000, 3600000];
    let i = 0;
    if (ms >= 1000)
        i = 1;
    if (ms >= 60000)
        i = 2;
    if (ms >= 3600000)
        i = 3;
    return `${i === 0 ? ms : (ms / scales[i]).toFixed(dm)} ${sizes[i]}`;
}
exports.formatMs = formatMs;
function formatBytes(bytes, decimals = 2) {
    if (!+bytes)
        return '0 Bytes';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
exports.formatBytes = formatBytes;
function keyGen(len = 6) {
    return (Math.random() + 1).toString(36).substring(2, 2 + len).toUpperCase();
}
exports.keyGen = keyGen;
