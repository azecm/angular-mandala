import {Injectable} from "@angular/core";
import {IPoint} from "../components/point";
import {Subject} from "rxjs";

export const classNameGrid = 'grid';

function svgElem(tagName: string) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName) as SVGElement;
}

@Injectable({providedIn: 'root'})
export class MandalaService {
    size: number;
    max = 0;
    elemContainer: HTMLElement;
    elemTools: HTMLElement;
    svg: MandalaSVG;
    state = new MandalaState();

    setSvg(svg: SVGSVGElement) {
        this.svg = new MandalaSVG(this, svg);

        setTimeout(() => {
            this.setSize();
        }, 0);
    }

    print(...args: (string|number)[]){
        const d = document.createElement('div');
        document.body.appendChild(d);
        d.textContent = args.join(' | ');
    }

    setSize() {
        const width = this.elemContainer.offsetWidth;
        const height = document.documentElement.clientHeight;

        //this.print(width, height);

        if (width > height) {
            if (this.elemTools) {
                this.size = height - Math.round(this.elemTools.offsetHeight * 1.2) - 20;
            } else {
                this.size = height - 50;
            }
        } else {
            this.size = width - 20;
        }

        this.svg.container.setAttribute('width', this.size.toString());
        this.svg.container.setAttribute('height', this.size.toString());
        this.svg.layers.setAttribute('transform', `translate(${this.size / 2}, ${this.size / 2})`);

    }

    setMax(p: IPoint) {
        this.max = Math.round(Math.max(this.max, p.x * p.x + p.y * p.y));
    }
}

export enum FigureType {
    curveBasis = 1, curveCatmullRom, circle
}

class MandalaState {
    strokeWidth = 2;
    accuracy = 4;
    parts = 16;
    private _color = '#009999';
    private _fill = '#bff1ff';
    mirror = false;
    mesh = false;
    boundless = false;

    type = FigureType.curveBasis;
    closed = false;
    withStroke = true;
    withFill = false;

    private colorSub = new Subject<void>();
    colorObs = this.colorSub.asObservable();

    private drawSub = new Subject<void>();
    drawObs = this.drawSub.asObservable();

    set color(val:string){
        this._color = val;
        this.colorSub.next();
    }

    get color(){
        return this._color;
    }

    set fill(val:string){
        this._fill = val;
        this.colorSub.next();
    }

    get fill(){
        return this._fill;
    }

    onDrawBegin(){
        this.drawSub.next();
    }

    isPath() {
        return this.type != FigureType.circle;
    }

    isCurveBasic(){
        return this.type == FigureType.curveBasis;
    }
}

class MandalaSVG {
    container: SVGSVGElement;
    private _layerID = 0;
    private _symbol: SVGElement;
    private _layer: SVGElement;

    figure: SVGElement;
    defs = svgElem('defs') as SVGDefsElement;
    layers = svgElem('g') as SVGGElement;
    grid = svgElem('g') as SVGGElement;
    param: MandalaService;

    constructor(param: MandalaService, container: SVGSVGElement) {
        this.param = param;
        this.container = container;
        this.init();
    }

    private init() {
        this.grid.classList.add(classNameGrid);
        this.container.appendChild(this.defs);
        this.container.appendChild(this.layers);
        this.container.appendChild(this.grid);
    }

    clear() {
        this.param.max = 0;
        this._layerID = 0;
        while (this.defs.firstChild != null) {
            this.defs.firstChild.remove();
        }
        while (this.layers.firstChild != null) {
            this.layers.firstChild.remove();
        }
    }

    layerRemove() {
        this._symbol.remove();
        this._layer.remove();
        this._layerID--;
    }

    undo() {
        if (this._layerID == 0) return;
        if (this.defs.lastChild && this.layers.lastChild) {
            this._symbol = this.defs.lastChild as SVGElement;
            this._layer = this.layers.lastChild as SVGElement;
        }
        this.layerRemove();
    }

    gridView() {
        while (this.grid.firstChild != null) {
            this.grid.firstChild.remove();
        }
        if (!this.param.state.mesh) return;

        const color = '#ddd';
        const size = this.param.size;

        if (this.param.state.parts > 1) {
            const symbol = svgElem('symbol') as SVGSymbolElement;
            symbol.id = 'mgrid';

            const line = svgElem('line') as SVGLineElement;
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', '0');
            line.setAttribute('y2', (size / 2).toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '1');
            symbol.appendChild(line);

            this.grid.append(symbol);
            const g = svgElem('g') as SVGGElement;
            g.setAttribute('transform', `translate(${size / 2}, ${size / 2})`);
            this.grid.append(g);


            const a2 = this.param.state.mirror ? Math.round(180 / this.param.state.parts) : 0;
            for (let i = 0; i < this.param.state.parts; i++) {
                const a = Math.round(360 / this.param.state.parts * i);
                const use = svgElem('use') as SVGUseElement;
                use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#mgrid');
                use.setAttribute('transform', `rotate(${a + a2})`);
                g.append(use);
            }
        }
        if (this.param.state.parts < 3) {
            const sizeBord = 4;
            const rect = svgElem('rect') as SVGRectElement;

            rect.setAttribute('x', ((size - sizeBord) / 2).toString());
            rect.setAttribute('y', ((size - sizeBord) / 2).toString());
            rect.setAttribute('width', size.toString());
            rect.setAttribute('height', size.toString());
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', color);

            this.grid.append(rect);
        }
    }

    layerAdd() {
        const {state} = this.param;

        this._layerID++;
        const idFig = 'fig' + this._layerID.toString();
        this._layer = svgElem('g') as SVGGElement;
        this._layer.id = 'layer' + this._layerID.toString();
        this._symbol = svgElem('symbol');
        this._symbol.id = idFig;
        this.figure = svgElem(state.isPath() ? 'path' : 'circle');

        this._symbol.append(this.figure);

        if (state.isPath()) {
            this.figure.setAttribute('stroke-linecap', 'round');
        }
        if (state.withStroke) {
            this.figure.setAttribute('stroke-width', state.strokeWidth.toString());
        }

        this.figure.setAttribute('fill', state.withFill ? state.fill : 'none');
        this.figure.setAttribute('stroke', state.withStroke ? state.color : 'none');

        for (let i = 0; i < state.parts; i++) {
            const a = (360 / state.parts * i);

            const use = svgElem('use') as SVGUseElement;
            use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + idFig);
            this._layer.append(use);

            let transform = `rotate(${a})`;
            if (state.mirror) {
                if (i % 2 == 1) {
                    transform = `rotate(${a}) scale(-1,1)`;
                }
            }
            use.setAttribute('transform', transform);
        }

        // ====

        this.defs.append(this._symbol);
        this.layers.append(this._layer);
    }
}
