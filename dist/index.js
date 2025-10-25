"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hh = hh;
const colors_1 = require("./utils/colors");
/** 生成提取符合rgb范围要求的部分的滤镜 */
const getRGBFilters = ({ sc, rr, rg, rb, ra }) => {
    const { r: sr, g: sg, b: sb } = (0, colors_1.calcColor)(sc);
    rr += 0.0001;
    rg += 0.0001;
    rb += 0.0001;
    const matrices = [
        [
            `1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 1 0 0 0 ${Math.min(rr - sr, 0)}`,
            `1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, -1 0 0 0 ${sr + rr}`,
            "1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 10000 0 0 0 0",
        ],
        [
            `0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 1 0 0 ${Math.min(rg - sg, 0)}`,
            `0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 -1 0 0 ${sg + rg}`,
            "0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 10000 0 0 0",
        ],
        [
            `0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 1 0 ${Math.min(rb - sb, 0)}`,
            `0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 -1 0 ${sb + rb}`,
            "0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 10000 0 0",
        ],
    ];
    const filters = matrices.map((items, index) => {
        return items
            .map((value, vi) => `
      <feColorMatrix
        in="${vi === 0 ? "SourceGraphic" : `cm-${index}-${vi - 1}`}"
        type="matrix"
        values="${value}"
        result="cm-${index}-${vi}"
      />
    `)
            .join("\n");
    });
    const coms = matrices.map((items, index) => {
        if (index < 1)
            return "";
        return `
      <feComposite
        in="${index === 1 ? `cm-${index - 1}-2` : `t${index - 2}`}"
        in2="cm-${index}-2"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="${index === matrices.length - 1 ? "t-rgb" : `t${index - 1}`}"
      />
    `;
    });
    return [
        ...filters,
        ...coms,
        `
      <feComponentTransfer in="t-rgb" result="w-rgb">
        <feFuncR type="table" tableValues="1 1" />
        <feFuncG type="table" tableValues="1 1" />
        <feFuncB type="table" tableValues="1 1" />
      </feComponentTransfer>
    `,
        `
      <feComposite
        in="w-rgb"
        in2="SourceGraphic"
        operator="arithmetic"
        k1="1"
        k2="0"
        k3="0"
        k4="0"
        result="source-rgb"
      />
    `,
    ].join("\n");
};
/** 生成提取符合透明度范围要求的滤镜 */
const getAlphaFilter = ({ sc, rr, rg, rb, ra }) => {
    const { a: sa } = (0, colors_1.calcColor)(sc);
    ra += 0.0001;
    const matrices = [
        [
            `0 0 0 1 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 ${Math.min(ra - sa, 0)}`,
            `-1 0 0 0 ${sa + ra}, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0`,
            "0 0 0 0 1, 0 0 0 0 1, 0 0 0 0 1, 100000 0 0 0 0",
        ],
    ];
    const filters = matrices.map((items) => {
        return items
            .map((value, vi) => `
      <feColorMatrix
        in="${vi === 0 ? "source-rgb" : `cm-a-${vi - 1}`}"
        type="matrix"
        values="${value}"
        result="${vi === items.length - 1 ? "t-final" : `cm-a-${vi}`}"
      />
    `)
            .join("\n");
    });
    return [...filters].join("\n");
};
const generateSvg = (id, params) => {
    const { r: tr, g: tg, b: tb, a: ta } = (0, colors_1.calcColor)(params.tc);
    const node = document.createElement("div");
    const rgbFilters = getRGBFilters(params);
    const alphaFilters = getAlphaFilter(params);
    const content = `
    <svg>
      <defs>
        <filter id=${id} color-interpolation-filters="sRGB">
          ${rgbFilters}

          ${alphaFilters}

          <feComponentTransfer in="t-final" result="left">
            <feFuncR type="table" tableValues="1 1" />
            <feFuncG type="table" tableValues="1 1" />
            <feFuncB type="table" tableValues="1 1" />
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>

          <feComposite
            in="left"
            in2="SourceGraphic"
            operator="arithmetic"
            k1="1"
            k2="0"
            k3="0"
            k4="0"
            result="left-source"
          />

          <feComponentTransfer in="t-final" result="content">
            <feFuncR type="table" tableValues="0 0" />
            <feFuncG type="table" tableValues="0 0" />
            <feFuncB type="table" tableValues="0 0" />
          </feComponentTransfer>

          <feComponentTransfer in="content" result="trans-content">
            <feFuncR type="discrete" tableValues="${tr} ${tr}" />
            <feFuncG type="discrete" tableValues="${tg} ${tg}" />
            <feFuncB type="discrete" tableValues="${tb} ${tb}" />
            <feFuncA type="discrete" tableValues="0 ${ta}" />
          </feComponentTransfer>

          <feBlend in="left-source" in2="trans-content" mode="normal" result="final" />
        </filter>
      </defs>
    </svg>
  `;
    node.innerHTML = content;
    return node;
};
/**
 * Only available in browser environment.
 * Generates SVG code with a special filter that replaces a specified color in an image
 * with another RGBA color. Automatically injects the SVG <defs> into a hidden node under <body>,
 * manages unique filter ids, and returns a CSS class name that applies `filter: url(#id)`.
 *
 * @param params - The filter parameters, either as a comma-separated string
 *   (`sourceColor,targetColor,errorRangeR,errorRangeG,errorRangeB,errorRangeA`)
 *   or as a partial object with the following properties:
 *   - sourceColor: The source color to be replaced (default: "#ffffffff").
 *   - targetColor: The target color to replace with (default: "#00000000").
 *   - errorRangeR: Allowed error range for red channel (default: 0).
 *   - errorRangeG: Allowed error range for green channel (default: 0).
 *   - errorRangeB: Allowed error range for blue channel (default: 0).
 *   - errorRangeA: Allowed error range for alpha channel (default: 0).
 *
 * @returns The generated CSS class name as a string.
 *
 * @throws {Error} If called outside browser environment or if the string format is invalid.
 *
 * @example
 * // Using object parameters
 * const className = hh({ sourceColor: "#66ccffff", targetColor: "#00000000", errorRangeR: 0.1, errorRangeG: 0.1, errorRangeB: 0.1, errorRangeA: 0 });
 * // <div className={className}>...</div>
 *
 * // Using string parameters
 * const className = hh("#66ccffff,#00000000,0.1,0.1,0.1,0");
 */
function hh(params) {
    // Check for browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("hh function can only be used in browser environment.");
    }
    const config = {
        sc: "",
        tc: "",
        rr: 0,
        rg: 0,
        rb: 0,
        ra: 0,
    };
    if (typeof params === "string") {
        const arr = params.split(",");
        if (arr.length !== 6) {
            throw new Error("Invalid string format. Expected 6 comma-separated values.");
        }
        config.sc = arr[0];
        config.tc = arr[1];
        config.rr = parseFloat(arr[2]) || 0;
        config.rg = parseFloat(arr[3]) || 0;
        config.rb = parseFloat(arr[4]) || 0;
        config.ra = parseFloat(arr[5]) || 0;
    }
    else {
        config.sc = params.sourceColor || "#ffffffff";
        config.tc = params.targetColor || "#00000000";
        config.rr = params.errorRangeR || 0;
        config.rg = params.errorRangeG || 0;
        config.rb = params.errorRangeB || 0;
        config.ra = params.errorRangeA || 0;
    }
    const id = `fe-hh-${[
        config.sc.replace(/^#+/, ""),
        config.tc.replace(/^#+/, ""),
        config.rr,
        config.rg,
        config.rb,
        config.ra,
    ].join("-")}`.replace(/\./g, "-");
    const className = `hh-filter-${id}`;
    // 1. Ensure a hidden container exists
    const containerId = "__hue_hydra_svg_defs__";
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "absolute";
        container.style.width = "0";
        container.style.height = "0";
        container.style.overflow = "hidden";
        container.style.visibility = "hidden";
        document.body.appendChild(container);
    }
    // 2. Check for existing filter id to avoid duplicates
    if (!container.querySelector(`[id="${id}"]`)) {
        const svg = generateSvg(id, config);
        container.appendChild(svg);
    }
    // 3. Generate a unique class name and inject style if not already present
    if (!document.getElementById(`hh-style-${id}`)) {
        const style = document.createElement("style");
        style.id = `hh-style-${id}`;
        style.innerHTML = `.${className} { filter: url(#${id}); }`;
        document.head.appendChild(style);
    }
    return className;
}
