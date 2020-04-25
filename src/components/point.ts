
export interface IPoint {
    x: number
    y: number
}

export class Point implements IPoint{
    x: number;
    y: number;
    static from(p:IPoint){
        return new Point(p.x,p.y);
    }
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    round():Point{
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    squaredDistanceTo(p:IPoint):number{
        const dx = this.x - p.x;
        const dy = this.y - p.y;
        return dx * dx + dy * dy;
    }
    distanceTo(p:IPoint):number{
        return Math.sqrt(this.squaredDistanceTo(p));
    }

}


const reEventType = /^(pointer|touch|mouse)/i;

function eventType(e: Event) {
    const m = e.type.match(reEventType);
    return m && m[1] || '';
}

export function eventPoint(ev: Event):IPoint {
    let x = 0, y = 0;

    switch (eventType(ev)) {
        case 'pointer':
        case 'mouse': {
            const evm = ev as PointerEvent;
            x = evm.pageX;
            y = evm.pageY;
            break;
        }
        case 'touch': {
            const evt = ev as TouchEvent;
            const touches = evt.touches;
            const touch = touches[0];
            x = touch.pageX;
            y = touch.pageY;
            break;
        }
    }

    return {x, y};
}

export function elementPoint(el: Element, ev: Event):IPoint {
    const rect = el.getBoundingClientRect();
    const p = eventPoint(ev);
    return {
        x: p.x - rect.left - window.scrollX,
        y: p.y - rect.top - window.scrollY
    };
}