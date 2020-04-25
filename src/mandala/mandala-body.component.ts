import {ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {DragDrop} from "../components/DragDrop";
import {IPoint, Point} from "../components/point";
import {MandalaService} from "./mandala.service";
import {MandalaFigure} from "./mandala.figure";


@Component({
    selector: 'mandala-body',
    template: `
        <svg #svg></svg>
    `,
    styleUrls: ['mandala-body.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MandalaBodyComponent implements OnInit{
    @ViewChild('svg', {static: true})
    svgElement: ElementRef<SVGSVGElement>;

    mFigure:MandalaFigure;

    constructor(private mandala: MandalaService) {
    }

    ngOnInit(): void {
        this.mandala.setSvg(this.svgElement.nativeElement);
        new DragDrop(this.svgElement.nativeElement, this.onMove.bind(this), this.onDrag.bind(this), this.onDrop.bind(this));
    }

    onMove(p:IPoint){
        const x = p.x - this.mandala.size / 2;
        const y = p.y - this.mandala.size / 2;
        this.mFigure.next(new Point(x, y));
    }

    onDrag(){
        this.mFigure = new MandalaFigure(this.mandala);
        this.mandala.state.onDrawBegin();
    }

    onDrop(){
        this.mFigure.finish();
    }
}