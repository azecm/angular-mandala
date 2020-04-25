import {IPoint, Point} from "../components/point";
import {MandalaService} from "./mandala.service";

import * as simplify from 'simplify-js';
import * as d3 from "d3";


//import * as paper from 'paper';
// https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
// https://github.com/d3/d3-shape/blob/master/README.md#curves
// http://paperjs.org/tutorials/paths/working-with-path-items/
// http://paperjs.org/tutorials/paths/smoothing-simplifying-flattening/


export class MandalaFigure {
    started = false;
    points = [] as Point[];
    accuracy: number;
    private _path: string;
    private _prev: Point;
    private mandala: MandalaService;
    prevSimplSize = 0;
    resPath: IPoint[] = [];

    constructor(mandala: MandalaService) {
        this.mandala = mandala;
        this.mandala.svg.layerAdd();
    }

    next(p: Point) {

        this.mandala.setMax(p);
        this.points.push(Point.from(p).round());
        if (this.points.length == 1) return;

        if (this.mandala.state.isPath()) {
            this.started = true;

            const lineFun = d3.line<IPoint>().x(d => d.x).y(d => d.y)
                .curve( this.mandala.state.isCurveBasic() ? d3.curveBasis : d3.curveCatmullRom.alpha(0.5));

            //path_simplify(this.points, this.mandala.state.accuracy)
            this._path = (lineFun(simplify(this.points, this.mandala.state.accuracy)) + '')
                .replace(/(\d+\.\d+)/g, (_, a, b) => `${round(parseFloat(a))}`);
            this.mandala.svg.figure.setAttribute('d', this._path);
        } else {
            const prev = this.points[0];
            const r = round(prev.distanceTo(p));
            if (r > 2) {
                this.mandala.setMax({x: prev.x + r, y: prev.y + r});
                this.started = true;
                const {figure} = this.mandala.svg;

                figure.setAttribute('cx', round(prev.x).toString());
                figure.setAttribute('cy', round(prev.y).toString());
                figure.setAttribute('r', r.toString());
            }
        }

        //const path = new paper.Path({
        //    segments: this.points.map(p=>[p.x, p.y]),
        //    strokeColor: 'black'
        //});

        //path.simplify(2);
        //path.smooth();


        //const ps = simplify(this.points, this.mandala.state.accuracy);

        //const lineFunction = d3.line()
        //    .x((d)=>  d.x)
        //    .y((d)=>  d.y)
        //                         .interpolate("linear");

        //console.log(this.points.length, path_simplify(this.points,1).length, path_simplify(this.points,2).length);
        //console.log(2, path_simplify(this.points,0.3).length);


        //.x(d=>round(d.x)).y(d=>round(d.y));
        //const lineFun = this.mandala.state.accuracy > 3
        //    ? d3.line<IPoint>().x(d => d.x).y(d => d.y).curve(d3.curveBasis)
        //    : d3.line<IPoint>().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(0.5))
        //;

        // http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8


        //console.log(lineFun(this.points));
        /*
        let res = [] as IPoint[];
        const last = 3;
        if(ps.length<last){
            res = ps;
        }
        else{
            if(ps.length>this.prevSimplSize){
                this.prevSimplSize=ps.length;
                console.log('++',ps.length-last);
                this.resPath.push(ps[ps.length-last])
            }

            res = [...this.resPath, ...ps.slice(this.resPath.length)];
        }
        */


        //this._path = svgPath(ps, bezierCommand);//getPathDataNew(ps);


    }

    next_old(p: Point) {
        /*
        this.mandala.setMax(p);
        if (!this.points.length) {
            this.points.push(Point.from(p).round());
            this.accuracy = 0;
        } else {
            if (this.mandala.state.figure.isPath()) {
                this.accuracy += this._prev.squaredDistanceTo(p);
                if (this.accuracy > this.mandala.state.accuracy) {
                    //if (points.last.squaredDistanceTo(p) > mandalaState.accuracy+30) {
                    this.started = true;
                    this.points.push(Point.from(p).round());
                    this.accuracy = 0;
                }

                const ps = this.points[this.points.length - 1].squaredDistanceTo(p) > 0 ? [...this.points, p] : this.points;
                this._path = getPathDataNew(ps);
                this.mandala.svg.figure.setAttribute('d', this._path);
                //_figure.setAttribute('d', getPathDataLine(ps));
                //if (type == 1) _figure.setAttribute('d', getPathDataNew(ps, _svg));
                //if (type == 2) _figure.setAttribute('d', getPathDataLine(ps));
            } else {
                const prev = this.points[this.points.length - 1];
                const r = round(prev.distanceTo(p));
                if (r > 2) {
                    this.mandala.setMax({x: prev.x + r, y: prev.y + r});
                    this.started = true;
                    const {figure} = this.mandala.svg;

                    figure.setAttribute('cx', round(prev.x).toString());
                    figure.setAttribute('cy', round(prev.y).toString());
                    figure.setAttribute('r', r.toString());
                }
            }
        }
        this._prev = p;

         */
    }

    finish() {
        if (this.started) {
            if (this.mandala.state.isPath() && this.mandala.state.closed) {
                this.mandala.svg.figure.setAttribute('d', this._path + ' Z');
            }
        } else {
            this.mandala.svg.layerRemove();
        }
    }
}

// =================
// https://github.com/volkerp/fitCurves
// https://stackoverflow.com/questions/27731213/algorithm-for-path-simplification-and-smoothing-of-2d-trajectories
// https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

// https://github.com/paperjs/paper.js/blob/master/src/path/PathFitter.js
// http://paperjs.org/examples/path-simplification/
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

function path_simplify_r(path: IPoint[], first: number, last: number, eps: number): IPoint[] {
    if (first >= last - 1) return [path[first]];

    const px = path[first].x;
    const py = path[first].y;

    const dx = path[last].x - px;
    const dy = path[last].y - py;

    const nn = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / nn;
    const ny = dx / nn;

    let ii = first;
    let max = -1;

    for (let i = first + 1; i < last; i++) {
        const p = path[i];

        const qx = p.x - px;
        const qy = p.y - py;

        const d = Math.abs(qx * nx + qy * ny);
        if (d > max) {
            max = d;
            ii = i;
        }
    }

    if (max < eps) return [path[first]];

    const p1 = path_simplify_r(path, first, ii, eps);
    const p2 = path_simplify_r(path, ii, last, eps);

    return p1.concat(p2);
}

function path_simplify(path: IPoint[], eps: number) {
    const p = path_simplify_r(path, 0, path.length - 1, eps);
    return p.concat([path[path.length - 1]]);
}


// ====================

function getPathDataNew(points: IPoint[]) {
    const data = [] as string[];
    const n = points.length - 1;
    if (n < 1) return '';

    const firstControlPoints = [] as IPoint[];
    const secondControlPoints = [] as IPoint[];
    if (n == 1) {
        /*
        // 3P1 = 2P0 + P3
        firstControlPoints.add(Point((2 * points[0].x + points[1].x) / 3,
            (2 * points[0].y + points[1].y) / 3));

        // P2 = 2P1 – P0
        secondControlPoints.add(Point(2 * firstControlPoints[0].y - points[0].x,
            2 * firstControlPoints[0].y - points[0].y));

         */
        const first = Point.from(points[0]).round();
        const last = Point.from(points[points.length - 1]).round();
        data.push(`M ${first.x},${first.y}`);
        data.push(`L ${last.x},${last.y}`);
        return data.join(' ');
    } else {
        // Calculate first Bezier control points

        // Get first control points X-values
        const x = GetFirstControlPoints(rhsVector(points, 'x'));
        // Get first control points Y-values
        const y = GetFirstControlPoints(rhsVector(points, 'y'));

        // Fill output arrays.
        for (let i = 0; i < n; ++i) {
            // First control point
            //firstControlPoints[i] = Point(x[i], y[i]);

            firstControlPoints.push({x: x[i], y: y[i]});
            // Second control point
            if (i < n - 1) {
                secondControlPoints.push({
                    x: 2 * points[i + 1].x - x[i + 1], y: 2 * points[i + 1].y - y[i + 1]
                });
            } else {
                secondControlPoints.push(
                    {x: (points[n].x + x[n - 1]) / 2, y: (points[n].y + y[n - 1]) / 2});
            }
        }
    }

    let {x, y} = points[0];
    data.push(`M ${round(x)},${round(y)}`);
    for (let i = 1; i < n + 1; ++i) {
        const p0 = firstControlPoints[i - 1];
        const p1 = secondControlPoints[i - 1];
        const p2 = points[i];

        data.push(
            `c ${round(p0.x - x)} ${round(p0.y - y)},${round(p1.x - x)} ${round(p1.y - y)},${round(p2.x - x)} ${round(p2.y - y)}`);
        x = p2.x;
        y = p2.y;
    }

    return data.join(' ');
}

function line(pointA: IPoint, pointB: IPoint) {
    const lengthX = pointB.x - pointA.x;
    const lengthY = pointB.y - pointA.y;
    return {
        length: Math.sqrt(lengthX * lengthX + lengthY * lengthY),
        angle: Math.atan2(lengthY, lengthX)
    }
}

function controlPoint(current: IPoint, previous: IPoint, next: IPoint, reverse: boolean) {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;
    // The smoothing ratio
    const smoothing = 0.2;
    // Properties of the opposed-line
    const o = line(p, n);
    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    // The control point position is relative to the current point
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;
    return {x, y};
}

function bezierCommand(point: IPoint, i: number, a: IPoint[]) {
    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point, false);
    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
}

function svgPath(points: IPoint[], command: (point: IPoint, i: number, a: IPoint[]) => string) {
    // build the d attributes by looping over the points
    const d = points.reduce((acc, point, i, a) => i === 0    // if first point
        ? `M ${point.x},${point.y}`    // else
        : `${acc} ${command(point, i, a)}`
        , '');
    return d;//`<path d="${d}" fill="none" stroke="grey" />`;
}

// https://www.npmjs.com/package/simplify-js
// simplify-js

function round(x: number) {
    return Math.round(x * 10) / 10;
}

function rhsVector(points: IPoint[], key: 'x' | 'y') {
    // Right hand side vector
    const n = points.length - 1;
    const rhs = [] as number[];

    rhs.push(points[0][key] + 2 * points[1][key]);
    for (let i = 1; i < n - 1; ++i) {
        rhs.push(4 * points[i][key] + 2 * points[i + 1][key]);
    }
    rhs.push((8 * points[n - 1][key] + points[n][key]) / 2.0);

    return rhs;
}

function GetFirstControlPoints(rhs: number[]) {
    const x = [] as number[];
    const tmp = [0];
    const n = rhs.length;

    let b = 2.0;
    x.push(rhs[0] / b);

    for (let i = 1; i < n; i++) {
        tmp.push(1 / b);
        b = (i < n - 1 ? 4.0 : 3.5) - tmp[i];
        x.push((rhs[i] - x[i - 1]) / b);
    }

    for (let i = 1; i < n; i++) {
        x[n - i - 1] -= tmp[n - i] * x[n - i];
    }

    return x;
}