import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild, ViewEncapsulation
} from "@angular/core";
import {ColorHSV} from "./ColorHSV";
import {DragDrop} from "../DragDrop";
import {IPoint} from "../point";


@Component({
    selector: 'picker-strip',
    template: `
        <div #drag class="drag">
            <div class="drag-left"></div>
            <div class="drag-right"></div>
        </div>
        <canvas #strip width="30" height="150"></canvas>
    `,
    styleUrls: ['picker-strip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class PickerStripComponent implements OnInit {
    @ViewChild('drag', {static: true})
    elemDrag: ElementRef<HTMLElement>;
    @ViewChild('strip', {static: true})
    elemStrip: ElementRef<HTMLCanvasElement>;

    _colorHSV: ColorHSV;
    @Output()
    colorHSVChange = new EventEmitter<ColorHSV>();

    cxStrip: CanvasRenderingContext2D;
    height: number;

    @Input()
    set colorHSV(val: ColorHSV) {
        this._colorHSV = ColorHSV.copy(val);
        const top = this._colorHSV.h * this.height / 360;
        this.position(top);
    }

    ngOnInit(): void {
        const cv = this.elemStrip.nativeElement;
        this.cxStrip = cv.getContext('2d') as CanvasRenderingContext2D;
        this.height = cv.height;
        this.cxStrip.rect(0, 0, cv.width, cv.height);
        const grd1 = this.cxStrip.createLinearGradient(0, 0, 0, cv.height);
        grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
        this.cxStrip.fillStyle = grd1;
        this.cxStrip.fill();

        new DragDrop(cv, this.move.bind(this));
    }

    position(top: number){
        this.elemDrag.nativeElement.style.transform = `translateY(${top}px)`;
    }

    move(p: IPoint) {
        if (p.y < 0) p.y = 0;
        if (p.y > this.height) p.y = this.height - 0.001;

        this.position(p.y);
        this._colorHSV.h = p.y / this.height * 360;
        this.colorHSVChange.emit(this._colorHSV);
    }
}