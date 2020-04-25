import {NgModule} from "@angular/core";
import {PickerComponent} from "./picker.component";
import {PickerRectComponent} from "./picker-rect.component";
import {BrowserModule} from "@angular/platform-browser";
//import {DragDropModule} from "@angular/cdk/drag-drop";
import {PickerStripComponent} from "./picker-strip.component";


@NgModule({
    declarations: [
        PickerComponent,
        PickerRectComponent,
        PickerStripComponent
    ],
    imports: [
        BrowserModule
    ],
    exports:[PickerComponent]
})
export class PickerModule{}