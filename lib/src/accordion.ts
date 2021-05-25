import { Input } from '@angular/core';

import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';

export class AccordionItemView extends StackLayout {

  @Input() debug;

  get isDebug() { return this.debug || this.debug === ''; }
  get debugClass() { return this.isDebug ? 'debug' : ''; }

  constructor() { super(); }

  onLoaded() {
    super.onLoaded();
    if (this.isDebug) { this.className = this.debugClass; }
  }

}
