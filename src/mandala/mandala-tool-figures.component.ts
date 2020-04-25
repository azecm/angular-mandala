import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {FigureType, MandalaService} from "./mandala.service";
import {IPoint} from "../components/point";
import * as d3 from "d3";
import {Subscription} from "rxjs";

const data1 = [
    {x: 4, y: 4},
    {x: 20, y: 20},
    {x: 6, y: 20},
    {x: 22, y: 4}
] as IPoint[];


@Component({
    selector: 'mandala-figures',
    templateUrl: 'mandala-tool-figures.component.html',
    styleUrls: ['mandala-tool-figures.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MandalaToolFiguresComponent implements OnInit, OnDestroy {

    visible = false;
    private colorSub: Subscription;
    private drawBeginSub: Subscription;

    constructor(private mandala: MandalaService, private crd: ChangeDetectorRef) {
    }

    get colorStrokeFig() {
        return this.mandala.state.withStroke ? this.mandala.state.color : 'none';
    }

    get colorFillFig() {
        return this.mandala.state.withFill ? this.mandala.state.fill : 'none';
    }

    get curveBasisFig() {
        return this.curveBasis + (this.pathClosed ? ' Z' : '');
    }

    get curveCatmullRomFig() {
        return this.curveCatmullRom + (this.pathClosed ? ' Z' : '');
    }

    get colorStroke() {
        return this.mandala.state.color;
    }


    get curveBasis() {
        const lineFun = d3.line<IPoint>().x(d => d.x).y(d => d.y)
            .curve(d3.curveBasis);
        return lineFun(data1);
    }

    get curveCatmullRom() {
        const lineFun = d3.line<IPoint>().x(d => d.x).y(d => d.y)
            .curve(d3.curveCatmullRom.alpha(0.5));
        return lineFun(data1);
    }

    get FigureType() {
        return FigureType;
    }

    eventStop(e: Event) {
        e.stopPropagation();
    }

    ngOnInit(): void {
        this.close = this.close.bind(this);

        this.colorSub = this.mandala.state.colorObs.subscribe(() => {
            this.crd.markForCheck();
        });

        this.drawBeginSub = this.mandala.state.drawObs.subscribe(()=>{
            this.close();
        });
    }

    ngOnDestroy(): void {
        this.colorSub.unsubscribe();
        this.drawBeginSub.unsubscribe();
    }

    get withStroke() {
        return this.mandala.state.withStroke;
    }

    set withStroke(val) {
        this.mandala.state.withStroke = val;
        if (!val && !this.mandala.state.withFill) {
            setTimeout(() => {
                this.mandala.state.withStroke = true;
                this.crd.markForCheck();
            }, 1);
        }
    }

    get withFill() {
        return this.mandala.state.withFill;
    }

    set withFill(val) {
        this.mandala.state.withFill = val;
        if (!val && !this.mandala.state.withStroke) {
            setTimeout(() => {
                this.mandala.state.withFill = true;
                this.crd.markForCheck();
            }, 1);
        }
    }

    get pathClosed() {
        return this.mandala.state.closed;
    }

    set pathClosed(val) {
        this.mandala.state.closed = val;
    }

    get currentTypeCurveBasis() {
        return this.mandala.state.type == FigureType.curveBasis;
    }

    get currentTypeCurveCatmullRom() {
        return this.mandala.state.type == FigureType.curveCatmullRom;
    }

    get currentTypeCircle() {
        return this.mandala.state.type == FigureType.circle;
    }

    close() {
        if (this.visible) {
            this.visible = false;
            document.removeEventListener('click', this.close);
            this.crd.markForCheck();
        }
    }

    onOpen() {
        if (this.visible) {
            this.close();
        } else {
            this.close = this.close.bind(this);
            this.visible = true;
            setTimeout(() => {
                document.addEventListener('click', this.close);
            }, 0);
        }
    }

    onType(num: FigureType) {
        this.mandala.state.type = num;

    }

}