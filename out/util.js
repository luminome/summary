"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyGen = exports.formatBytes = exports.formatMs = void 0;
function formatMs(ms, decimals) {
    if (decimals === void 0) { decimals = 3; }
    if (!+ms)
        return '0 ms';
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['ms', 's', 'm', 'h'];
    var scales = [1, 1000, 60000, 3600000];
    var i = 0;
    if (ms >= 1000)
        i = 1;
    if (ms >= 60000)
        i = 2;
    if (ms >= 3600000)
        i = 3;
    return "".concat(i === 0 ? ms : (ms / scales[i]).toFixed(dm), " ").concat(sizes[i]);
}
exports.formatMs = formatMs;
function formatBytes(bytes, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (!+bytes)
        return '0 Bytes';
    var k = 1000; // 1024
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return "".concat(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)), " ").concat(sizes[i]);
}
exports.formatBytes = formatBytes;
// export const baseUrl = 'https://api.example.com';
function keyGen(len) {
    if (len === void 0) { len = 6; }
    return (Math.random() + 1).toString(36).substring(2, 2 + len).toUpperCase();
}
exports.keyGen = keyGen;
//exports.ref = 'hello';
// export const keyGen = () => (Math.random() + 1).toString(36).substring(2,6).toUpperCase();
// export default keyGen
