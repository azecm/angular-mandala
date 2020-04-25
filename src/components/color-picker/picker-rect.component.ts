import {
    ChangeDetectionStrategy,
    Component,
    ElementRef, EventEmitter,
    Input, OnDestroy,
    OnInit, Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ColorHSV} from "./ColorHSV";
import {DragDrop} from "../DragDrop";
import {IPoint} from "../point";


@Component({
    selector: 'picker-rect',
    template: `
        <div #drag class="drag" [ngClass]="{white: isDragWhite}"></div>
        <canvas #rect width="150" height="150"></canvas>
    `,
    styleUrls: ['picker-rect.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class PickerRectComponent implements OnInit, OnDestroy {
    @ViewChild('drag', {static: true})
    elemDrag: ElementRef<HTMLElement>;

    @ViewChild('rect', {static: true})
    elemRect: ElementRef<HTMLCanvasElement>;

    @Output()
    colorHSVChange = new EventEmitter<ColorHSV>();

    isDragWhite = false;
    _colorHSV: ColorHSV;

    width: number;
    height: number;
    cxRect: CanvasRenderingContext2D;
    drag: DragDrop;

    @Input()
    set colorHSV(val: ColorHSV) {
        this._colorHSV = ColorHSV.copy(val);
        if (this.cxRect) this.gradient();

        const x = val.s * this.width / 100;
        const y = (100 - val.v) * this.height / 100;
        this.position({x, y})
    }

    ngOnInit(): void {

        const cv = this.elemRect.nativeElement;
        this.width = cv.width;
        this.height = cv.height;
        this.cxRect = cv.getContext('2d') as CanvasRenderingContext2D;
        this.cxRect.rect(0, 0, this.width, this.height);

        this.drag = new DragDrop(cv, this.move.bind(this));
        this.gradient();
    }

    ngOnDestroy(): void {
        this.drag.destroy();
    }

    position(p: IPoint) {
        this.elemDrag.nativeElement.style.transform = `translate(${p.x}px,${p.y}px)`;
        this.isDragWhite = p.y > this.height / 2;
    }

    move(p: IPoint) {
        if (p.x < 0) p.x = 0;
        if (p.y < 0) p.y = 0;
        if (p.x > this.width) p.x = this.width;
        if (p.y > this.height) p.y = this.height;

        this.position(p);

        const colorHSV = this._colorHSV;
        colorHSV.s = Math.round(p.x / this.width * 100);
        colorHSV.v = Math.round(100 - (p.y / this.height * 100));

        this.colorHSVChange.emit(colorHSV);
    }


    gradient() {
        const {cxRect} = this;
        cxRect.fillStyle = new ColorHSV().set(this._colorHSV.h, 100, 100).toRGBString(true);

        cxRect.fillRect(0, 0, this.width, this.height);

        const grdWhite = cxRect.createLinearGradient(0, 0, this.width, 0);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        cxRect.fillStyle = grdWhite;
        cxRect.fillRect(0, 0, this.width, this.height);

        const grdBlack = cxRect.createLinearGradient(0, 0, 0, this.height);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        cxRect.fillStyle = grdBlack;
        cxRect.fillRect(0, 0, this.width, this.height);
    }
}