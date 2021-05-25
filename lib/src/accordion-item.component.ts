import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { AccordionItemView } from './accordion';

@Component({
  selector: 'AccordionItem',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() index;

  @Input() _height;
  @Input() _isExpanded;
  @Input() _isActive = false;

  @Output() isExpanded = new EventEmitter();
  @Output() isCollapsed = new EventEmitter();
  @Output() isActive = new EventEmitter();

  ngOnInit() { }

  ngAfterViewInit() { }

  ngOnDestroy() { }

}
