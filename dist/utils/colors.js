"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcColor = void 0;
/** 将十六进制颜色转换为rgb颜色 */
const calcColor = (hex) => {
    // 支持 #RRGGBBAA 或 #RRGGBB
    if (!/^#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})$/.test(hex)) {
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
};
exports.calcColor = calcColor;
