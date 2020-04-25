import {elementPoint, IPoint} from "./point";

type TMove = (p: IPoint) => void;
type TDrag = () => void;

export class DragDrop {
    private readonly fnDrag?: TDrag;
    private readonly fnDrop?: TDrag;
    private readonly fnMove: TMove;
    private readonly el: Element;
    private timeStamp = 0;

    constructor(el: Element, fnMove: TMove, fnDrag?: TDrag, fnDrop?: TDrag) {
        this.end = this.end.bind(this);
        this.move = this.move.bind(this);
        this.mousedown = this.mousedown.bind(this);
        this.touchstart = this.touchstart.bind(this);

        this.el = el;
        this.fnMove = fnMove;
        this.fnDrag = fnDrag;
        this.fnDrop = fnDrop;

        this.el.addEventListener('mousedown', this.mousedown);
        this.el.addEventListener('touchstart', this.touchstart);
    }

    destroy() {
        this.el.removeEventListener('mousedown', this.mousedown);
        this.el.removeEventListener('touchstart', this.touchstart);
    }

    private touchstart(e: Event) {
        if (this.fnDrag) this.fnDrag();
        this.el.addEventListener('touchmove', this.move);
        this.el.addEventListener('touchend', this.end);
        this.el.addEventListener('touchcancel', this.end);
        this.move(e);
    }

    private mousedown(e: Event) {
        if (this.fnDrag) this.fnDrag();
        document.addEventListener('mouseup', this.end);
        document.addEventListener('mousemove', this.move);
        this.move(e);
    }

    private end() {
        if (this.fnDrop) this.fnDrop();
        this.el.removeEventListener('touchmove', this.move);
        this.el.removeEventListener('touchend', this.end);
        this.el.removeEventListener('touchcancel', this.end);

        document.removeEventListener('mouseup', this.end);
        document.removeEventListener('mousemove', this.move);
    }

    private move(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        if (this.timeStamp == e.timeStamp) return;
        this.timeStamp = e.timeStamp;
        this.fnMove(elementPoint(this.el, e))
    }
}