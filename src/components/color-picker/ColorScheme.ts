


// https://github.com/c0bra/color-scheme-js

type TScheme = 'mono' | 'contrast' | 'triade' | 'tetrade' | 'analogic';

interface IPresets {
    default: number[]
    pastel: number[]
    soft: number[]
    light: number[]
    hard: number[]
    pale: number[]
}

export type TKeyPresets = keyof IPresets;

const PRESETS: IPresets = {
    default: [-1, -1, 1, -0.7, 0.25, 1, 0.5, 1],
    pastel: [0.5, -0.9, 0.5, 0.5, 0.1, 0.9, 0.75, 0.75],
    soft: [0.3, -0.8, 0.3, 0.5, 0.1, 0.9, 0.5, 0.75],
    light: [0.25, 1, 0.5, 0.75, 0.1, 1, 0.5, 1],
    hard: [1, -1, 1, -0.6, 0.1, 1, 0.6, 1],
    pale: [0.1, -0.85, 0.1, 0.5, 0.1, 1, 0.1, 0.75]
};

const COLOR_WHEEL = {
    0: [255, 0, 0, 100],
    15: [255, 51, 0, 100],
    30: [255, 102, 0, 100],
    45: [255, 128, 0, 100],
    60: [255, 153, 0, 100],
    75: [255, 178, 0, 100],
    90: [255, 204, 0, 100],
    105: [255, 229, 0, 100],
    120: [255, 255, 0, 100],
    135: [204, 255, 0, 100],
    150: [153, 255, 0, 100],
    165: [51, 255, 0, 100],
    180: [0, 204, 0, 80],
    195: [0, 178, 102, 70],
    210: [0, 153, 153, 60],
    225: [0, 102, 178, 70],
    240: [0, 51, 204, 80],
    255: [25, 25, 178, 70],
    270: [51, 0, 153, 60],
    285: [64, 0, 153, 60],
    300: [102, 0, 153, 60],
    315: [153, 0, 153, 60],
    330: [204, 0, 153, 80],
    345: [229, 0, 102, 90]
};

class MutableColor {
    hue = 0;
    saturation = [] as number[];
    base_value = 0;
    value = [] as number[];
    base_red = 0;
    base_green = 0;
    base_blue = 0;
    base_saturation = 0;
    constructor(hue: number) {
        this.set_hue(hue);
        this.set_variant_preset(PRESETS.default);
    }
    get_hue() {
        return this.hue;
    }
    set_hue(h: number) {
        const avrg = (a: number, b: number, k: number) => a + Math.round((b - a) * k);
        this.hue = Math.round(h % 360);
        const d = this.hue % 15 + (this.hue - Math.floor(this.hue));
        const k = d / 15;
        let derivative1 = this.hue - Math.floor(d);
        let derivative2 = (derivative1 + 15) % 360;
        if (derivative1 === 360) {
            derivative1 = 0;
        }
        if (derivative2 === 360) {
            derivative2 = 0;
        }

        const colorset1 = (COLOR_WHEEL as any)[derivative1];
        const colorset2 = (COLOR_WHEEL as any)[derivative2];

        this.base_red = avrg(colorset1[0], colorset2[0], k);
        this.base_green = avrg(colorset1[1], colorset2[1], k);
        this.base_blue = avrg(colorset1[2], colorset2[2], k);
        this.base_value = avrg(colorset1[3], colorset2[3], k);

        this.base_saturation = avrg(100, 100, k) / 100;
        return this.base_value /= 100;
    }
    rotate(angle: number) {
        return this.set_hue((this.hue + angle) % 360);
    }
    get_saturation(variation: number) {
        const x = this.saturation[variation];
        let s = x < 0 ? -x * this.base_saturation : x;
        if (s > 1) {
            s = 1;
        }
        if (s < 0) {
            s = 0;
        }
        return s;
    }
    get_value(variation: number) {
        const x = this.value[variation];
        let v = x < 0 ? -x * this.base_value : x;
        if (v > 1) {
            v = 1;
        }
        if (v < 0) {
            v = 0;
        }
        return v;
    }
    set_variant(variation: number, s: number, v: number) {
        this.saturation[variation] = s;
        return this.value[variation] = v;
    }
    set_variant_preset(p: number[]) {
        const results = [] as number[];
        for (let i = 0, m = 0; m <= 3; i = ++m) {
            results.push(this.set_variant(i, p[2 * i], p[2 * i + 1]));
        }
        return results;
    }
    get_hex(web_safe: boolean, variation: number) {

        const max = Math.max(this.base_red, this.base_green, this.base_blue);

        const min = (val: number) => Math.min(255, Math.round(v - (v - val * k) * s));

        const v = (variation < 0 ? this.base_value : this.get_value(variation)) * 255;
        const s = variation < 0 ? this.base_saturation : this.get_saturation(variation);
        const k = max > 0 ? v / max : 0;

        const rgb = [min(this.base_red), min(this.base_green), min(this.base_blue)];

        if (web_safe) {
            for (let i = 0; i < rgb.length; i++) {
                rgb[i] = Math.round(rgb[i] / 51) * 51;
            }
        }

        let formatted = '';
        for (let n = 0; n < rgb.length; n++) {
            formatted += ('0' + rgb[n].toString(16)).slice(-2);
        }
        return formatted;
    }

}

export class ColorScheme {
    col = [] as MutableColor[];
    private _scheme = 'mono' as TScheme;
    private _distance = 0.5;
    private _web_safe = false;
    private _add_complement = false;

    constructor() {

        for (let m = 1; m <= 4; m++) {
            this.col.push(new MutableColor(60));
        }
    }

    colors() {
        let used_colors = 1;
        const h = this.col[0].get_hue();
        const dispatch = {
            mono: () => { },
            contrast: () => {
                used_colors = 2;
                this.col[1].set_hue(h);
                return this.col[1].rotate(180);
            },
            triade: () => {
                used_colors = 3;
                const dif = 60 * this._distance;
                this.col[1].set_hue(h);
                this.col[1].rotate(180 - dif);
                this.col[2].set_hue(h);
                return this.col[2].rotate(180 + dif);
            },
            tetrade: () => {
                used_colors = 4;
                const dif = 90 * this._distance;
                this.col[1].set_hue(h);
                this.col[1].rotate(180);
                this.col[2].set_hue(h);
                this.col[2].rotate(180 + dif);
                this.col[3].set_hue(h);
                return this.col[3].rotate(dif);
            },
            analogic: () => {
                used_colors = this._add_complement ? 4 : 3;
                const dif = 60 * this._distance;
                this.col[1].set_hue(h);
                this.col[1].rotate(dif);
                this.col[2].set_hue(h);
                this.col[2].rotate(360 - dif);
                this.col[3].set_hue(h);
                return this.col[3].rotate(180);
            }
        };

        if (dispatch[this._scheme] != null) {
            dispatch[this._scheme]();
        } else {
            throw "Unknown color scheme name: " + this._scheme;
        }
        const output = [] as string[];
        for (let i = 0, m = 0, ref1 = used_colors - 1; 0 <= ref1 ? m <= ref1 : m >= ref1; i = 0 <= ref1 ? ++m : --m) {
            for (let j = 0, n = 0; n <= 3; j = ++n) {
                output[i * 4 + j] = this.col[i].get_hex(this._web_safe, j);
            }
        }
        return output;
    }

    colorset() {
        const flat_colors = clone(this.colors());
        const grouped_colors = [];
        while (flat_colors.length > 0) {
            grouped_colors.push(flat_colors.splice(0, 4));
        }
        return grouped_colors;
    }

    from_hue(h: number) {
        this.col[0].set_hue(h);
        return this;
    }

    rgb2ryb(rgb: number[]) {
        let red = rgb[0], green = rgb[1], blue = rgb[2];
        const white = Math.min(red, green, blue);
        red -= white;
        green -= white;
        blue -= white;
        const maxgreen = Math.max(red, green, blue);
        let yellow = Math.min(red, green);
        red -= yellow;
        green -= yellow;
        if (blue > 0 && green > 0) {
            blue /= 2;
            green /= 2;
        }
        yellow += green;
        blue += green;
        const maxyellow = Math.max(red, yellow, blue);
        if (maxyellow > 0) {
            const iN = maxgreen / maxyellow;
            red *= iN;
            yellow *= iN;
            blue *= iN;
        }
        red += white;
        yellow += white;
        blue += white;
        return [Math.floor(red), Math.floor(yellow), Math.floor(blue)];
    }

    rgb2hsv(rgb: number[]) {
        let h = 0, s = 0, v = 0;

        let r = rgb[0], g = rgb[1], b = rgb[2];
        r /= 255;
        g /= 255;
        b /= 255;
        const min = Math.min.apply(Math, [r, g, b]);
        const max = Math.max.apply(Math, [r, g, b]);
        const d = max - min;
        v = max;
        if (d > 0) {
            s = d / max;
        } else {
            return [0, 0, v];
        }
        h = (r === max ? (g - b) / d : (g === max ? 2 + (b - r) / d : 4 + (r - g) / d));
        h *= 60;
        h %= 360;
        return [h, s, v];
    }

    rgbToHsv(rgb: number[]) {
        let h = 0, s = 0, v = 0;

        let r = rgb[0], g = rgb[1], b = rgb[2];
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    from_hex(hex: string) {

        hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;

        if (hex.length == 3) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }

        let r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
        const ref2 = this.rgb2ryb([r, g, b]);
        r = ref2[0], g = ref2[1], b = ref2[2];
        const hsv = this.rgbToHsv([r, g, b]);

        const h = hsv[0];
        const s = hsv[1];
        const v = hsv[2];
        this.from_hue(h * 360);
        this._set_variant_preset([s, v, s, v * 0.7, s * 0.25, 1, s * 0.5, 1]);
        return this;
    }
    add_complement(b: boolean) {
        this._add_complement = b;
        return this;
    }
    web_safe(b: boolean) {
        this._web_safe = b;
        return this;
    }

    distance(d: number) {
        if (d < 0) {
            throw "distance(" + d + ") - argument must be >= 0";
        }
        if (d > 1) {
            throw "distance(" + d + ") - argument must be <= 1";
        }
        this._distance = d;
        return this;
    }
    scheme(name: TScheme) {
        this._scheme = name;
        return this;
    }
    variation(v: TKeyPresets) {
        if (PRESETS[v] == null) {
            throw "'$v' isn't a valid variation name";
        }
        this._set_variant_preset(PRESETS[v]);
        return this;
    }
    private _set_variant_preset(p: number[]) {
        const results = [] as number[][];
        for (let i = 0; i < 4; i++) {
            results.push(this.col[i].set_variant_preset(p));
        }
        return results;
    }
}


function clone(obj: any) {
    if ((obj == null) || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
        let flags = '';
        if (obj.global != null) {
            flags += 'g';
        }
        if (obj.ignoreCase != null) {
            flags += 'i';
        }
        if (obj.multiline != null) {
            flags += 'm';
        }
        if ((obj as any).sticky != null) {
            flags += 'y';
        }
        return new RegExp(obj.source, flags);
    }
    const newInstance = new obj.constructor();
    for (const key in obj) {
        newInstance[key] = clone(obj[key]);
    }
    return newInstance;
}