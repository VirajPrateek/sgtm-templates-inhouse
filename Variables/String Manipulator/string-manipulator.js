const makeInteger = require('makeInteger');
const logToConsole = require('logToConsole');

function run() {
    const op = data.operation;
    logToConsole("Operation:", op);

    // -----------------------------
    // SPLIT OPERATION
    // -----------------------------
    if (op === "split") {
        const input = data.inputString || "";

        if (!input || typeof input !== "string") {
            return "";
        }

        const delimiter = data.delimiter || "";
        const start = makeInteger(data.startIndex || 0);
        const endRaw = data.endIndex;
        const end = endRaw === undefined || endRaw === "" ? null : makeInteger(endRaw);

        logToConsole("Input:", input);
        logToConsole("Delimiter:", delimiter);
        logToConsole("Start index:", start);
        logToConsole("End index:", end);

        const parts = delimiter ? input.split(delimiter) : [input];

        if (end === null) {
            return parts[start] !== undefined ? parts[start] : "";
        }

        const slice = parts.slice(start, end + 1);
        return slice.join(delimiter);
    }

    // -----------------------------
    // CONCAT OPERATION
    // -----------------------------
    if (op === "concat") {
        const sep = data.concatSeparator || "";
        const rows = data.concatItems || [];

        logToConsole("Concat rows:", rows);
        logToConsole("Separator:", sep);

        // Extract non-empty values
        const values = [];
        for (let i = 0; i < rows.length; i++) {
            const val = rows[i].value;
            if (val !== undefined && val !== null && val !== "") {
                values.push(val);
            }
        }

        logToConsole("Extracted values:", values);

        // Single value: return value + separator
        if (values.length === 1) {
            return values[0] + sep;
        }

        // Multiple values: join with separator
        if (values.length > 1) {
            return values.join(sep);
        }

        // No values
        return "";
    }

    // -----------------------------
    // REPLACE OPERATION
    // -----------------------------
    if (op === "replace") {
        const input = data.inputString || "";
        // Basic type check
        if (!input || typeof input !== "string") {
            return "";
        }

        const oldVal = data.replaceRaw || "";
        const newVal = data.replaceWith || "";
        const replaceAll = data.replaceAll;

        // If nothing to find, return original
        if (oldVal === "") {
            return input;
        }

        if (replaceAll) {
            // Split and join is a robust way to replace all without regex regex complications in sandbox
            return input.split(oldVal).join(newVal);
        }

        return input.replace(oldVal, newVal);
    }

    // FALLBACK
    return "";
}

return run();