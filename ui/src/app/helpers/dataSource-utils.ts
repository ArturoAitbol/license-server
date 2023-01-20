import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, of, combineLatest, concat, defer } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { QueryList } from '@angular/core';
// import { merge } from 'rxjs/observable/merge';

export class SimpleDataSource<T> extends DataSource<T> {
    constructor(private rows$: Observable<T[]>) { super(); }
    connect(collectionViewer: CollectionViewer): Observable<T[]> { return this.rows$; }
    disconnect(collectionViewer: CollectionViewer): void { }
}


/** Creates an Observable stream of PageEvent objects from a MatPaginator component */
export function fromMatPaginator(pager: MatPaginator): Observable<PageEvent> {
    return concat(
        defer(() => of({
            pageIndex: pager.pageIndex,
            pageSize: pager.pageSize,
            length: pager.length,
        })),
        pager.page.asObservable()
    );
}

/** RxJs operator to paginate an array based on an Observable of PageEvent objects **/
export function paginateRows<U>(page$: Observable<PageEvent>): (obs$: Observable<U[]>) => Observable<U[]> {
    return (rows$: Observable<U[]>) => combineLatest(
        rows$,
        page$,
        (rows, page) => {
            const startIndex = page.pageIndex * page.pageSize;
            const copy = rows.slice();
            return copy.splice(startIndex, page.pageSize);
        }
    );
}