import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

type Action = 'expandAll' | 'collapseAll' | 'addItems';

@Injectable({ providedIn: 'root' })
export class AccordionService {

  private actionSubject = new Subject<{ type: Action, data?: [] }>();

  public expandAll() { this.actionSubject.next({ type: 'expandAll' }); }
  public collapseAll() { this.actionSubject.next({ type: 'collapseAll' }); }

  public addItems(feed: []) { this.actionSubject.next({ type: 'addItems', data: feed }); }

  public watchAction$() { return this.actionSubject.asObservable(); }

}
