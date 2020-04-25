import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {classNameGrid, MandalaService} from "./mandala.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'mandala-tools',
    templateUrl: 'mandala-tools.component.html',
    styleUrls: ['mandala-tools.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MandalaToolsComponent implements OnInit, OnDestroy{

    viewSelectorStroke = false;
    viewSelectorFill = false;

    drawBeginSub: Subscription;

    constructor(private elRef: ElementRef, private mandala: MandalaService, private crd: ChangeDetectorRef) {
        this.mandala.elemTools = this.elRef.nativeElement;
    }

    ngOnInit(): void {
        this.drawBeginSub = this.mandala.state.drawObs.subscribe(()=>{
            this.viewSelectorStroke = false;
            this.viewSelectorFill = false;
            this.crd.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.drawBeginSub.unsubscribe();
    }

    get colorStroke() {
        return this.mandala.state.color;
    }

    set colorStroke(color: string) {
        this.mandala.state.color = color;
    }

    get colorFill() {
        return this.mandala.state.fill;
    }

    set colorFill(color: string) {
        this.mandala.state.fill = color;
    }

    get strokeWidth() {
        return this.mandala.state.strokeWidth.toString();
    }

    set strokeWidth(valStr: string) {
        this.mandala.state.strokeWidth = parseInt(valStr, 10);
    }

    get accuracy() {
        return this.mandala.state.accuracy.toString();
    }

    set accuracy(valStr: string) {
        this.mandala.state.accuracy = parseInt(valStr, 10);
    }

    get parts() {
        return this.mandala.state.parts;
    }

    set parts(val: number) {
        this.mandala.state.parts = val;
        this.mandala.svg.gridView();
    }

    get mirror() {
        return this.mandala.state.mirror;
    }

    get mesh() {
        return this.mandala.state.mesh;
    }

    get boundless() {
        return this.mandala.state.boundless;
    }

    onClear() {
        this.mandala.svg.clear();
    }

    onColorStroke() {
        this.viewSelectorStroke = !this.viewSelectorStroke;
        this.viewSelectorFill = false;
    }

    onColorFill() {
        this.viewSelectorFill = !this.viewSelectorFill;
        this.viewSelectorStroke = false;
    }

    onMirror(e: Event) {
        e.preventDefault();
        this.mandala.state.mirror = !this.mandala.state.mirror;
    }

    onMesh(e: Event) {
        e.preventDefault();
        this.mandala.state.mesh = !this.mandala.state.mesh;
        this.mandala.svg.gridView();
    }

    onOutline(e: Event) {
        e.preventDefault();
        this.mandala.state.boundless = !this.mandala.state.boundless;

        if (this.mandala.state.boundless) {
            this.mandala.svg.container.style.overflow = 'visible';
        } else {
            this.mandala.svg.container.removeAttribute('style');
        }
    }

    onUndo(e: Event) {
        e.preventDefault();
        this.mandala.svg.undo();
    }

    onSave() {

        const maxR = Math.sqrt(this.mandala.max);

        const svg = this.mandala.svg.container.cloneNode(true) as SVGSVGElement;
        svg.getElementsByClassName(classNameGrid)[0].remove();

        const style = document.createElement('style');
        style.textContent = 'symbol{overflow: visible;}';
        svg.insertBefore(style, svg.firstChild);

        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        const size = this.mandala.size;
        if (size / 2 < maxR) {
            const d = Math.round(maxR - size / 2) + 5;
            svg.setAttribute('viewBox', `${-d} ${-d} ${size + 2 * d} ${size + 2 * d}`);
        }

        //        const serializer = new XMLSerializer();
        //
        //         let svgData = serializer.serializeToString(this.elem.svg.el).replace('xmlns:xlink="http://www.w3.org/1999/xlink"', '--**--');
        //         svgData = svgData.replace(/\sxmlns\:xlink=\"http\:\/\/www\.w3\.org\/1999\/xlink\"/gi, '');
        //         svgData = svgData.replace('--**--', 'xmlns:xlink="http://www.w3.org/1999/xlink"');
        //
        //         //<!-- Generator: Adobe Illustrator 22.0.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        //
        //         const source = [
        //             '<?xml version="1.0" encoding="utf-8"?>',
        //             '<!-- Generator: https://www.toybytoy.com/console/Draw-mandala  -->',
        //             svgData
        //         ].join('\r\n');
        //         const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

        const svgData = [
            '<?xml version="1.0" encoding="utf-8"?>',
            '<!-- Generator: https://www.toybytoy.com/console/Draw-mandala -->',
            svg.outerHTML
        ].join('\r\n');

        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);

        const fileKey = new Date().toJSON().replace('T', '_').replace(/:/g, '-').slice(0, -5);
        const fileName = 'toybytoy-mandala-' + fileKey + '.svg';

        const link = document.createElement('a');
        link.setAttribute('download', fileName)
        link.setAttribute('target', '_blank')
        link.setAttribute('href', url);
        document.body.append(link);
        link.click();
        link.remove();
    }
}