import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { Observable } from 'rxjs';
import { distinctUntilChanged, withLatestFrom } from 'rxjs/operators';

const PAGE_SIZE = 25;

export interface IAccordionState {
  feed: [];
  activeFeed: [];
  cursorFeed: [];
  cursorIndex: number;
}

export const DEFAULT_STATE: IAccordionState = {
  feed: [],
  activeFeed: [],
  cursorFeed: [],
  cursorIndex: undefined,
};

@Injectable()
export class AccordionStore extends ComponentStore<IAccordionState> {

  private pageSize;

  constructor() {
    super(DEFAULT_STATE);
  }

  readonly getFeed$ = this.select(state => state.feed);
  readonly setFeed = this.updater((state: IAccordionState, feed: []) => ({ ...state, feed }));

  readonly getActiveFeed$ = this.select(state => state.activeFeed);
  readonly setActiveFeed = this.updater((state: IAccordionState, activeFeed: []) => ({ ...state, activeFeed }));

  readonly getCursorFeed$ = this.select(state => state.cursorFeed);
  readonly setCursorFeed = this.updater((state: IAccordionState, cursorFeed: []) => ({ ...state, cursorFeed }));

  readonly getCursorIndex$ = this.select(state => state.cursorIndex);
  readonly setCursorIndex = this.updater((state: IAccordionState, cursorIndex: number) => ({ ...state, cursorIndex }));

  readonly updateCursor = this.effect((cursorIndex$: Observable<number>) => {
    cursorIndex$
      .pipe(
        distinctUntilChanged(),
        withLatestFrom(this.getFeed$, this.getActiveFeed$),
      )
      .subscribe(([index, feed, activeFeed]) => {
        const pageSize = this.getPageSize();
        const fromIndex = index * pageSize;
        const toIndex = (index + 1) * pageSize;
        const cursorFeed = <[]>feed.slice(fromIndex, toIndex);
        const activeCursorFeed = <[]>activeFeed.concat(cursorFeed);
        this.setCursorIndex(++index);
        this.setCursorFeed(cursorFeed);
        this.setActiveFeed(activeCursorFeed);
      });
    return cursorIndex$;
  });

  getPageSize() { return this.pageSize || PAGE_SIZE; }
  setPageSize(limit) { this.pageSize = limit; }

}
