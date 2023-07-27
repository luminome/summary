"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = void 0;
/*
THIS is the SUMMARY MODULE (npm link);
Generator to find all comment summaries with prefix set by 'textual_marker';
It's a pretty remarkable little tool the uses the madge library.
*/
//--functional-summary
var file_io_ts_1 = require("./file-io.ts");
var util_ts_1 = require("./util.ts");
var madge_1 = __importDefault(require("madge"));
var textual_marker = '--functional-summary';
// var flat:dependency[];
var flattened = new Map();
var check = function (path) {
    var in_map = flattened.get(path);
    if (in_map === undefined) {
        var k = { path: path, uses: 1, bytes: 0, lines: 0, summary: 'blank' };
        flattened.set(path, k);
    }
    else {
        in_map.uses++;
    }
};
var filter = function (src) {
    Object.keys(src).map(function (path) {
        check(path);
        src[path].map(function (sub_path) {
            check(sub_path);
        });
    });
};
var read_summary = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var map_el, raw_read, has_summary, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                map_el = flattened.get(path);
                return [4 /*yield*/, (0, file_io_ts_1.read)(path)];
            case 1:
                raw_read = _a.sent();
                console.log(raw_read.message, raw_read.bytes_read, raw_read.num_lines);
                if (raw_read.payload) {
                    has_summary = raw_read.payload.indexOf("//".concat(textual_marker));
                    map_el.bytes = !map_el.bytes ? raw_read.bytes_read : 0;
                    map_el.lines = !map_el.lines ? raw_read.num_lines + 1 : 1;
                    if (has_summary !== -1) {
                        text = raw_read.payload.slice(0, has_summary);
                        map_el.summary = text;
                    }
                }
                return [2 /*return*/, map_el.summary];
        }
    });
}); };
var summary = function (path, save_json) {
    (0, madge_1.default)(path, { fileExtensions: ['ts', 'js'] }).then(function (res) {
        console.log(res);
        filter(res.obj());
        var results = [];
        for (var _i = 0, flattened_1 = flattened; _i < flattened_1.length; _i++) {
            var _a = flattened_1[_i], path_1 = _a[0], _ = _a[1];
            results.push(read_summary(path_1));
        }
        var indices = __spreadArray([], flattened.keys(), true);
        Promise.all(results).then(function (r) {
            r.map(function (summary, i) {
                var map_el = flattened.get(indices[i]);
                summary = summary.replace('/*\n', '');
                summary = summary.replace('\n*/\n', '');
                map_el.summary = summary.split('\n');
            });
            console.log(__spreadArray([], flattened, true));
            // console.log([...flattened.values()]);
            save_json && (0, file_io_ts_1.write)(save_json, JSON.stringify(__spreadArray([], flattened.values(), true), null, 2));
        });
        return true;
    }).finally(function (r) { return console.log('sync part done', r); });
    return { result: null };
};
exports.summary = summary;
exports.default = (function (path, dom_obj, save_json) {
    if (save_json === void 0) { save_json = ''; }
    console.log((0, util_ts_1.keyGen)(), path, dom_obj, __filename);
    path && (0, exports.summary)(path, save_json);
});
