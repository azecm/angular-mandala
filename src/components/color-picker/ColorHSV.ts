export class ColorHSV {
    static copy(v:ColorHSV){
        return new ColorHSV().set(v.h, v.s, v.v);
    }

    h: number = 0;
    s: number = 0;
    v: number = 0;

    set(h: number, s: number, v: number) {
        this.h = h;
        this.s = s;
        this.v = v;
        return this;
    }

    private _diff(_c: number, _v: number, _d: number) {
        return (_v - _c) / 6 / _d + 1 / 2;
    }

    toRGBString(flag = true): string {
        const {h, s, v} = this;
        let R = 0, G = 0, B = 0;
        const _s = s / 100;
        const _v = v / 100;
        const lH = Math.floor(h / 60);
        const f = h / 60 - lH;
        const p = _v * (1 - _s);
        const q = _v * (1 - _s * f);
        const t = _v * (1 - (1 - f) * _s);

        switch (lH) {
            case 0:
                R = _v;
                G = t;
                B = p;
                break;
            case 1:
                R = q;
                G = _v;
                B = p;
                break;
            case 2:
                R = p;
                G = _v;
                B = t;
                break;
            case 3:
                R = p;
                G = q;
                B = _v;
                break;
            case 4:
                R = t;
                G = p;
                B = _v;
                break;
            case 5:
                R = _v;
                G = p;
                B = q;
                break;
        }

        const r = Math.round(R * 255);
        const g = Math.round(G * 255);
        const b = Math.round(B * 255);

        const rv = r.toString(16);
        const gv = g.toString(16);
        const bv = b.toString(16);

        return (flag ? '#' : '') +
            (rv.length == 1 ? '0' + rv : rv) +
            (gv.length == 1 ? '0' + gv : gv) +
            (bv.length == 1 ? '0' + bv : bv);

    }

    fromRGB(rgbColor: string): ColorHSV {
        rgbColor =
            (rgbColor.startsWith("#") ? rgbColor.substring(1) : rgbColor).trim();

        if (rgbColor.length == 3) {
            const r = rgbColor.substring(0, 1);
            const g = rgbColor.substring(1, 2);
            const b = rgbColor.substring(2, 3);
            rgbColor = r + r + g + g + b + b;
        }

        const rv = parseInt(rgbColor.substring(0, 2), 16);
        const gv = parseInt(rgbColor.substring(2, 4), 16);
        const bv = parseInt(rgbColor.substring(4, 6), 16);

        const r = rv / 255, g = gv / 255, b = bv / 255;
        let _h = 0, _s = 0, _v = Math.max(r, Math.max(g, b));
        const _d = _v - Math.min(r, Math.min(g, b));

        if (_d != 0) {
            _s = _d / _v;
            const rr = this._diff(r, _v, _d);
            const gg = this._diff(g, _v, _d);
            const bb = this._diff(b, _v, _d);

            if (r == _v) {
                _h = bb - gg;
            } else if (g == _v) {
                _h = (1 / 3) + rr - bb;
            } else if (b == _v) {
                _h = (2 / 3) + gg - rr;
            }

            if (_h < 0) {
                _h += 1;
            } else if (_h > 1) {
                _h -= 1;
            }
        }

        this.h = _h * 360;
        this.s = _s * 100;
        this.v = _v * 100;

        return this;

    }
}
