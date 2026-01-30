//const log = require("logToConsole");
const Math = require("Math");
const makeNumber = require('makeNumber');
const makeString = require('makeString');
const sha256Sync = require('sha256Sync');
const JSON = require('JSON');
const toBase64 = require('toBase64');

var rs;
const tp = data.functionType;
var op1 = makeNumber(data.op1);
var op2 = makeNumber(data.op2);
var op3 = makeNumber(data.op3);

const replaceAll = function (str, oldstr, newstr) {
    var rs = str;
    if (oldstr === newstr) return rs;
    while (rs.indexOf(oldstr) >= 0)
        rs = rs.replace(oldstr, newstr);
    return rs;
};

switch (tp) {
    case "calc":
        const fn = data.calcFunctionName;

        if (fn.indexOf("b_") >= 0) {
            var op1_bool = makeString(data.op1).toLowerCase();
            op1_bool = op1_bool === "true" || op1_bool === "1";
            var op2_bool = makeString(data.op2).toLowerCase();
            op2_bool = op2_bool === "true" || op2_bool === "1";
        }

        switch (fn) {
            case "add": rs = op1 + op2; break;
            case "subtract": rs = op1 - op2; break;
            case "multiply": rs = op1 * op2; break;
            case "divide": rs = op1 / op2; break;
            case "b_and": rs = op1_bool && op2_bool; break;
            case "b_or": rs = op1_bool || op2_bool; break;
            case "b_not": rs = !op1_bool; break;
        }
        break;
    case "math":
        const mf = data.mathMethodName;
        switch (mf) {
            case "abs": rs = Math.abs(op1); break;
            case "ceil": rs = Math.ceil(op1); break;
            case "floor": rs = Math.floor(op1); break;
            case "max": rs = Math.max(op1, op2); break;
            case "min": rs = Math.min(op1, op2); break;
            case "round": rs = Math.round(op1); break;
            case "trunc": rs = Math.floor(op1); break;
            case "pow": rs = Math.pow(op1, op2); break;
            case "sqrt": rs = Math.sqrt(op1); break;
        }
        break;
    case "strings":
        op1 = makeString(data.op1);
        var op2s = makeString(data.op2 || "");
        var op3s = makeString(data.op3 || "");
        const sf = data.stringMethodName;
        switch (sf) {
            case "indexOf": rs = op1.indexOf(op2s); break;
            case "lastIndexOf": rs = op1.lastIndexOf(op2s); break;
            case "split": rs = op1.split(op2s); break;
            case "splitSpecial":
                rs = op1.split(op2s);
                rs = (rs.length >= op3) ? rs[op3s] : undefined;
                break;
            case "toLowerCase": rs = op1.toLowerCase(); break;
            case "toUpperCase": rs = op1.toUpperCase(); break;
            case "replace": rs = op1.replace(op2s, op3s); break;
            case "replaceAll": rs = replaceAll(op1, op2s, op3s); break;
            case "slice": rs = op1.slice(op2, op3); break;
            case "substr": rs = op1.substring(op2, op3 + op2); break;
            case "substring": rs = op1.substring(op2, op3); break;
            case "toFixed": var mul = Math.pow(10, op2); rs = makeNumber(Math.round(op1 * mul) / mul); break;
            case "toNumber":
                var idxComma = op1.indexOf(",");
                var idxDot = op1.indexOf(".");
                if ((idxComma > 0) && (idxDot > 0)) {
                    if (idxComma > idxDot)
                        rs = replaceAll(replaceAll(op1, ".", ""), ",", ".");
                    else
                        rs = replaceAll(op1, ",", "");
                } else if (idxComma > 0)
                    rs = replaceAll(op1, ",", ".");
                rs = makeNumber(rs);
                break;
            case "match": var fnd = op1.match(op2s);
                if (fnd) { rs = fnd[0]; }
                break;
            case "sha256":
                if (data.undefinedPassThrough === true && (data.op1 === undefined) || (data.op1 === null)) {
                    rs = data.op1;
                } else rs = sha256Sync(op1);
                break;
            case "base64": rs = toBase64(op1); break;
            case "jstringify": rs = JSON.stringify(data.op1); break;
            case "jparse": rs = JSON.parse(data.op1); break;
        }
        break;
    case "array":
        const af = data.arrayMethodName;
        switch (af) {
            case "length":
                var arr = data.op1;
                if (arr && typeof arr.length === 'number') {
                    rs = arr.length;
                } else {
                    rs = 0;
                }
                break;
        }
        break;
}

const rt = data.resultTransformation;
if (tp === "calc" && data.calcFunctionName.indexOf("b_") >= 0) {
    if (rt == 'string') return makeString(rs);
    if ((rt == 'floor') || (rt == 'round')) return (rs === true) ? 1 : 0;
    return rs;
}
if (rt == 'round') return Math.round(makeNumber(rs)); else
    if (rt == 'string') return makeString(makeNumber(rs)); else
        if (rt == 'floor') return Math.floor(makeNumber(rs)); else
            if (rt == 'fixed') return makeNumber(Math.round(makeNumber(rs) * 100) / 100); else
                return rs;