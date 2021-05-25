import { Component } from '@angular/core';

import { AccordionService } from 'nativescript-ngx-accordion';

import { clamp, times } from 'ramda';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  title = 'nativescript-ngx-accordion';

  public items = times(() => ({ h: clamp(50, 300, Math.floor(Math.random() * 300)) }), 30);

  constructor(
    private accordionService: AccordionService,
  ) { }

  public expandAll() {
    this.accordionService.expandAll();
  }

  public collapseAll() {
    this.accordionService.collapseAll();
  }

  public isActive(args) { console.log(args); }


  public addMore() {
    const list = times(() => ({ h: clamp(50, 300, Math.floor(Math.random() * 300)) }), 100);
    this.accordionService.addItems(list);
  }


}
