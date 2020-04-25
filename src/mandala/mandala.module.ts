import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {PickerModule} from "../components/color-picker/picker.module";
import {MandalaContainerComponent} from "./mandala-container.component";
import {MandalaBodyComponent} from "./mandala-body.component";
import {MandalaToolsComponent} from "./mandala-tools.component";
import {MandalaToolFiguresComponent} from "./mandala-tool-figures.component";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        MandalaContainerComponent,
        MandalaBodyComponent,
        MandalaToolsComponent,
        MandalaToolFiguresComponent
    ],
    imports: [
        BrowserModule,
        PickerModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [MandalaContainerComponent]
})
export class MandalaModule { }