import {
    ChangeDetectionStrategy,
    Component, ElementRef, EventEmitter, HostBinding, HostListener,
    Input, OnInit,
    Output, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ColorHSV} from "./ColorHSV";
import {PickerRectComponent} from "./picker-rect.component";
import {ColorScheme, TKeyPresets} from "./ColorScheme";

const reRGB = /^(#)?([0-9a-f]{3,6})/i;
const reInp0 = /[#0-9a-f]/i;
const reInp1 = /[0-9a-f]/i;

@Component({
    selector: 'color-picker',
    templateUrl: 'picker.component.html',
    styleUrls: ['picker.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PickerRectComponent]
})
export class PickerComponent implements OnInit {

    @ViewChild('prev', {static: true})
    elemColorPrev: ElementRef<HTMLElement>;

    @ViewChild('current', {static: true})
    elemColorCurrent: ElementRef<HTMLElement>;

    _colorRGB: string;
    _colorRGBSource: string;
    @Output()
    colorRGBChange = new EventEmitter<string>();

    colorHSV: ColorHSV;
    isPalette = false;
    isScheme = false;

    @Input('auto-close')
    autoClose = false;

    private _visibility = true;

    @Output()
    visibilityChange = new EventEmitter<boolean>();

    colorInputError = false;

    schemeNumbers = Array(60).fill(0).map((_, i) => i);
    schemeColors = Array(60).fill('');
    _h = -1;

    ngOnInit(): void {
        this.close = this.close.bind(this);
    }

    open() {
        if (this._visibility) return;
        this._visibility = true;
        if (this.autoClose) {
            setTimeout(() => {
                document.addEventListener('click', this.close);
            }, 0);
        }
    }

    close() {
        if (!this._visibility) return;
        this._visibility = false;
        this.visibilityChange.emit(false);
        document.removeEventListener('click', this.close);
    }

    @Input()
    set colorRGB(val: string) {
        this._colorRGB = val;
        this.colorHSV = new ColorHSV().fromRGB(val);
        this.fillSchemeColors();
        if (!this._colorRGBSource) {
            this._colorRGBSource = this._colorRGB;
        }
    }

    @Input()
    set visibility(val: boolean) {
        if (val) {
            this.open();
        } else {
            this.close();
        }
    }

    @HostListener('click', ['$event'])
    hostClick(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    @HostBinding('class.display-none')
    get hostDisplayNone() {
        return !this._visibility;
    };

    @HostBinding('class.absolute')
    get hostPositionAbsolute() {
        return this.autoClose;
    };

    get palette() {
        return _palette;
    };

    schemeTrack(ind: number) {
        return ind;
    }

    onColorChange(val: ColorHSV) {
        this.colorHSV = ColorHSV.copy(val);
        this._colorRGB = this.colorHSV.toRGBString();
        this.colorRGBChange.emit(this._colorRGB);
        this.fillSchemeColors();
    }

    onColorRGB() {
        this.colorHSV = new ColorHSV().fromRGB(this._colorRGB);
        this.colorRGBChange.emit(this._colorRGB);
        this.fillSchemeColors();
    }

    onColor(val: string) {
        this._colorRGB = val;
        this.onColorRGB();
    }

    onPalette() {
        this.isScheme = false;
        this.isPalette = !this.isPalette;
    }

    onScheme() {
        this.isPalette = false;
        this.isScheme = !this.isScheme;
    }

    onColorRGBDown(e: KeyboardEvent) {
        const elem = e.target as HTMLInputElement;
        if (elem.selectionStart == elem.selectionEnd) {
            if (elem.selectionStart == 0) {
                if (!reInp0.test(e.key)) {
                    e.preventDefault();
                }
            } else {
                if (!reInp1.test(e.key)) {
                    e.preventDefault();
                }
            }
        }
    }

    onColorRGBInput(e: Event) {
        const elem = e.target as HTMLInputElement;
        const m = elem.value.match(reRGB);

        let colorInputError = true;
        if (m) {
            const color = m[2];
            if (color.length == 3 || color.length == 6) {
                this._colorRGB = '#' + color;
                this.onColorRGB();
                colorInputError = false;
            }
        }
        if (this.colorInputError != colorInputError) {
            this.colorInputError = colorInputError;
            elem.classList.toggle('error');
        }
    }

    setSourceColor() {
        if (this._colorRGB == this._colorRGBSource) return;
        this._colorRGB = this._colorRGBSource;
        this.onColorRGB();
    }

    setCurrentColor() {
        this._colorRGBSource = this._colorRGB;
    }

    fillSchemeColors() {
        const {h} = this.colorHSV;
        if (this._h == h) return;
        this._h = h;
        const list = [] as string[];

        const scm = new ColorScheme();
        scm.from_hue(h)
            .scheme('triade')
            .distance(0.5)
            .add_complement(false)
            .web_safe(false);

        //scm.from_hex(this.state.colorActive.substr(1)).scheme('triade').distance(0.5).add_complement(false).web_safe(false);

        const variation = ['default', 'pastel', 'soft', 'light', 'pale'] as TKeyPresets[];
        for (let v = 0; v < 5; v++) {
            const colorList = scm.variation(variation[v]).colors();
            for (const color of colorList) {
                list.push('#' + color);
            }
        }

        this.schemeColors = list;
    }
}

const _palette = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#d9d9d9",
    "#efefef",
    "#f3f3f3",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
    "#e6b8af",
    "#f4cccc",
    "#fce5cd",
    "#fff2cc",
    "#d9ead3",
    "#d9ead3",
    "#c9daf8",
    "#cfe2f3",
    "#d9d2e9",
    "#ead1dc",
    "#dd7e6b",
    "#ea9999",
    "#f9cb9c",
    "#ffe599",
    "#b6d7a8",
    "#a2c4c9",
    "#a4c2f4",
    "#9fc5e8",
    "#b4a7d6",
    "#d5a6bd",
    "#cc4125",
    "#e06666",
    "#f6b26b",
    "#ffd966",
    "#93c47d",
    "#76a5af",
    "#6d9eeb",
    "#6fa8dc",
    "#8e7cc3",
    "#c27ba0",
    "#a61c00",
    "#cc0000",
    "#e69138",
    "#f1c232",
    "#6aa84f",
    "#45818e",
    "#3c78d8",
    "#3d85c6",
    "#674ea7",
    "#a64d79",
    "#85200c",
    "#990000",
    "#b45f06",
    "#bf9000",
    "#38761d",
    "#134f5c",
    "#1155cc",
    "#0b5394",
    "#351c75",
    "#741b47",
    "#5b0f00",
    "#660000",
    "#783f04",
    "#7f6000",
    "#274e13",
    "#0c343d",
    "#1c4587",
    "#073763",
    "#20124d",
    "#4c1130"
];