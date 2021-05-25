import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

import { ScrollView } from 'tns-core-modules/ui/scroll-view';

import { Subscription } from 'rxjs';

import { AccordionItemComponent } from './accordion-item.component';
import { AccordionService } from './accordion.service';
import { AccordionStore } from './accordion.store';

@Component({
  selector: 'Accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [AccordionStore],
})
export class AccordionComponent extends ScrollView implements OnInit, AfterViewInit, OnDestroy {

  public pageList = [];
  public pageIndex = 0;

  private activeFeedSub: Subscription;

  @Input() templateRef;

  @Input() set limit(value) {
    const pageSize = (value > 0) ? value : null;
    this.accordionStore.setPageSize(pageSize);
  }

  @Input() set items(feed) {
    this.accordionStore.setFeed(feed);
    this.addItemsEmitter.emit(feed);
  }

  @Output('addItems') addItemsEmitter = new EventEmitter();
  @Output('eofItems') eofItemsEmitter = new EventEmitter();

  get activeFeed$() { return this.accordionStore.getActiveFeed$; }

  constructor(
    public accordionStore: AccordionStore,
    private accordionService: AccordionService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
  ) {
    super();
  }

  ngOnInit() {
    this.accordionStore.updateCursor(0);
    this.activeFeedSub = this.accordionStore.getActiveFeed$.subscribe(feed => {
      this.pageList = feed;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.activeFeedSub.unsubscribe();
  }

}
