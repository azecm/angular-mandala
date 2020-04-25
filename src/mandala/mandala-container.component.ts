import {ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation} from "@angular/core";
import {MandalaService} from "./mandala.service";


@Component({
    selector: 'mandala-container',
    template: `
        <!--<color-picker [colorRGB]="colorRGB"></color-picker>-->
        <mandala-tools></mandala-tools>
        <mandala-body></mandala-body>
    `,
    styleUrls: ['mandala-container.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MandalaContainerComponent{
    //colorRGB = '#ff0000';
    constructor(private elRef:ElementRef, private mandala: MandalaService) {
        this.mandala.elemContainer = this.elRef.nativeElement;
    }


}