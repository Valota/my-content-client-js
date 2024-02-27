"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function htmlSpecialChars(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
exports.default = htmlSpecialChars;
