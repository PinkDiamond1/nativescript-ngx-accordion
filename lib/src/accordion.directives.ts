import { AfterContentInit, AfterViewInit, ChangeDetectorRef, ContentChild, Directive, ElementRef, Inject, OnDestroy, OnInit, ViewChild, forwardRef } from '@angular/core';

import { screen } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui';
import { TouchGestureEventData } from 'tns-core-modules/ui/gestures';
import { StackLayout } from 'tns-core-modules/ui/layouts';
import { ScrollEventData, ScrollView } from 'tns-core-modules/ui/scroll-view';

import { BehaviorSubject, Observable, Subscription, bindCallback, combineLatest, interval } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, take, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';
import { AccordionService } from './accordion.service';

@Directive({
  selector: 'Accordion',
})
export class AccordionComponentDirective implements OnInit, AfterViewInit, OnDestroy {

  private watchScrollEventSub: Subscription;
  private watchFeedSub: Subscription;

  private _scrollViewReadySubject = new BehaviorSubject(false);
  private _scrollViewReady$ = this._scrollViewReadySubject.asObservable();
  private _scrollViewHeight;

  private SCROLL_FACTOR;

  constructor(
    @Inject(forwardRef(() => AccordionComponent)) private accordionComponent: AccordionComponent,
    @Inject(forwardRef(() => AccordionService)) private accordionService: AccordionService,
    @Inject(forwardRef(() => ElementRef)) private scrollView: ElementRef,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initScrollView();
  }

  ngOnDestroy() { }

  public getStore() { return this.accordionComponent.accordionStore; }

  public getScrollView(): ScrollView { return this.scrollView.nativeElement; }

  public calcScrollViewHeight() {
    const height = this.getScrollView().height;
    const calcHeight = (height === 'auto') || height['unit']
      ? this.getScrollView().getActualSize().height as number
      : height as number;
    this.getScrollView().height = calcHeight;
    this.SCROLL_FACTOR = 0.8 * calcHeight;
    this._scrollViewHeight = calcHeight;
    this._scrollViewReadySubject.next(true);
    return calcHeight;
  }

  public getScrollViewHeight(): number { return this._scrollViewHeight; }

  public isScrollViewReady$() { return this._scrollViewReady$; }

  public initScrollView() {

    const watchScrollViewLoadEvent = Observable.create(subscriber => {
      this.scrollView.nativeElement.on('loaded', (e) => subscriber.next(e));
    });

    watchScrollViewLoadEvent
      .pipe(
        delay(100),
        take(1),
      )
      .subscribe(e => {
        this.watchScroll();
        this.watchFeedService();
      });

  }

  private watchScroll() {

    const scrollView = this.getScrollView();

    if (!scrollView) { throw Error('Failed to initialize Scroll View Container'); }

    this.calcScrollViewHeight();

    const watchScrollViewScrollEvent: Observable<number> = Observable.create(subscriber => {
      scrollView.on('scroll', (e: ScrollEventData) => subscriber.next(Math.floor(e.scrollY)));
    });

    this.watchScrollEventSub = watchScrollViewScrollEvent
      .pipe(
        throttleTime(100),
        tap(offset => offset + this.SCROLL_FACTOR > scrollView.scrollableHeight ? this.accordionComponent.eofItemsEmitter.emit(offset) : null),
        filter(offset => scrollView.scrollableHeight - offset < this.SCROLL_FACTOR),
        withLatestFrom(this.getStore().getFeed$, this.getStore().getCursorIndex$),
        filter(([offset, feed, index]) => feed.length > index * this.getStore().getPageSize()),
        distinctUntilChanged(),
      )
      .subscribe(e => {
        const index = ++this.accordionComponent.pageIndex;
        this.accordionComponent.accordionStore.updateCursor(index);
      });

  }

  private resetScrollPosition() {
    const scrollView = this.getScrollView();
    scrollView.scrollToVerticalOffset(scrollView.scrollableHeight - 25, true);
  }

  private watchFeedService() {
    this.watchFeedSub = this.accordionService.watchAction$()
      .pipe(
        filter(action => action.type === 'addItems'),
        map(action => action.data),
        withLatestFrom(this.getStore().getFeed$),
      )
      .subscribe(([newFeed, currentFeed]) => {
        const feed = <[]>currentFeed.concat(newFeed);
        this.getStore().setFeed(feed);
        this.resetScrollPosition();
        this.accordionComponent.addItemsEmitter.emit(feed);
      });
  }

}

@Directive({
  selector: '[accordion-item]',
})
export class AccordionItemComponentDirective implements OnInit, AfterViewInit, OnDestroy {

  @ContentChild('panelHeader', { read: ElementRef, static: false }) panelHeader: ElementRef;
  @ContentChild('panelBody', { read: ElementRef, static: false }) panelBody: ElementRef;

  constructor(
    @Inject(forwardRef(() => AccordionComponent)) private accordionComponent: AccordionComponent,
    @Inject(forwardRef(() => AccordionComponentDirective)) private accordionComponentDirective: AccordionComponentDirective,
    @Inject(forwardRef(() => AccordionItemComponent)) private accordionItemComponent: AccordionItemComponent,
    @Inject(forwardRef(() => AccordionService)) private accordionService: AccordionService,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.setupItem();
  }

  ngOnDestroy() { }

  private getPanelBodyView(): StackLayout {
    if (!this.panelBody) { return; }
    return this.panelBody.nativeElement;
  }

  private getPanelHeaderView(): StackLayout {
    if (!this.panelHeader) { return; }
    return this.panelHeader.nativeElement;
  }

  private getRootLayout(): StackLayout {
    if (!this.elementRef) { return; }
    return this.elementRef.nativeElement;
  }

  private getScrollView(): ScrollView {
    return this.accordionComponentDirective.getScrollView();
  }

  private setupItem() {

    const watchItemLoadedEvent$: Observable<View> = Observable.create(subscriber => {
      this.getRootLayout().on('loaded', (e) => subscriber.next((e.object)));
    });

    const itemPosition$ = watchItemLoadedEvent$
      .pipe(
        delay(100),
        map(o => o.getLocationOnScreen().y),
      );

    this.accordionComponentDirective.isScrollViewReady$()
      .pipe(
        filter(isReady => isReady),
        withLatestFrom(itemPosition$),
        filter(([isReady, posY]) => posY < 3 * this.accordionComponentDirective.getScrollViewHeight()),
        take(1),
      )
      .subscribe(() => {
        this.activateItem();
      });

    const watchScrollViewScrollEvent: Observable<number> = Observable.create(subscriber => {
      this.getScrollView().on('scroll', (e: ScrollEventData) => subscriber.next(Math.floor(e.scrollY)));
    });

    watchScrollViewScrollEvent
      .pipe(
        throttleTime(100),
        debounceTime(50),
        map(() => this.getPanelHeaderView().getLocationOnScreen().y),
        filter(posY => posY > -100 && posY < 2 * this.accordionComponentDirective.getScrollViewHeight()),
        filter(() => this.accordionItemComponent._isActive === false),
      )
      .subscribe(() => {
        this.activateItem();
      });

    this.accordionService.watchAction$()
      .pipe()
      .subscribe(action => {
        (action.type === 'expandAll') ? this.expandItem() : this.collapseItem();
      });

  }

  private activateItem() {
    this.accordionItemComponent._isActive = true;
    this.accordionItemComponent.isActive.emit(true);
    this.changeDetectorRef.detectChanges();
    this.collapseItem();
    this.getPanelHeaderView().on('tap', (e: TouchGestureEventData) => this.toggleItem(e));
  }

  private async toggleItem(e: TouchGestureEventData) {
    const currentIndex = this.accordionItemComponent.index;
    const isExpanded = this.accordionItemComponent._isExpanded;

    if (isExpanded) {
      this.getPanelBodyView().visibility = 'collapse';
      this.accordionItemComponent.isCollapsed.emit(e);
    } else {
      this.getPanelBodyView().visibility = 'visible';
      this.accordionItemComponent.isExpanded.emit(e);
    }

    await this.getPanelBodyView().animate({
      scale: this.accordionItemComponent._isExpanded ? { x: 1.2, y: 1.2 } : { x: 1, y: 1 },
    });
    this.accordionItemComponent._isExpanded = !this.accordionItemComponent._isExpanded;
    // this.accordionComponent.getScrollView().scrollToVerticalOffset(e.android.getY() + currentIndex * 10, true);
  }

  private expandItem() {
    if (!this.getPanelBodyView()) { return; }

    this.getPanelBodyView().scaleX = 1;
    this.getPanelBodyView().scaleY = 1;
    this.getPanelBodyView().visibility = 'visible';

    this.accordionItemComponent._isExpanded = true;
    this.accordionItemComponent.isExpanded.emit(true);
  }

  private collapseItem() {
    if (!this.getPanelBodyView()) { return; }

    this.getPanelBodyView().scaleX = 1.2;
    this.getPanelBodyView().scaleY = 1.2;
    this.getPanelBodyView().visibility = 'collapse';

    this.accordionItemComponent._isExpanded = false;
    this.accordionItemComponent.isExpanded.emit(false);
  }

}
