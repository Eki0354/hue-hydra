type HHErrorRange = number | "";
export type HueHydraStringParams = `${string},${string},${HHErrorRange},${HHErrorRange},${HHErrorRange},${HHErrorRange}`;
export type HueHydraParams = {
    /** Default: #ffffffff */
    sourceColor: string;
    /** Default: #00000000 */
    targetColor: string;
    /** Default: 0 */
    errorRangeR: number;
    /** Default: 0 */
    errorRangeG: number;
    /** Default: 0 */
    errorRangeB: number;
    /** Default: 0 */
    errorRangeA: number;
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
export declare function hh(params: Partial<HueHydraParams> | HueHydraStringParams): string;
export {};
