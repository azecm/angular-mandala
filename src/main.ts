import { enableProdMode, ViewEncapsulation } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import {MandalaModule} from "./mandala/mandala.module";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(MandalaModule, {
  defaultEncapsulation: ViewEncapsulation.ShadowDom
})
  .catch(err => console.error(err));
