import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { registerElement } from 'nativescript-angular/element-registry';

import { FlexboxLayout, StackLayout } from 'tns-core-modules/ui/layouts';
import { ScrollView } from 'tns-core-modules/ui/scroll-view';

import { ReactiveComponentModule } from '@ngrx/component';

import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';
import { AccordionComponentDirective, AccordionItemComponentDirective } from './accordion.directives';

registerElement('Accordion', () => ScrollView);

const COMPONENTS = [
  AccordionComponent,
  AccordionItemComponent,
];
const CONTAINERS = [];
const DIRECTIVES = [
  AccordionComponentDirective,
  AccordionItemComponentDirective,
];

@NgModule({
  imports: [
    CommonModule,
    NativeScriptCommonModule,
    ReactiveComponentModule,
  ],
  providers: [],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AccordionModule { }
