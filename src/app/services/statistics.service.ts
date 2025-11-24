import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
    constructor(private apiService: ApiService) {}

    getRecords(): Observable<any> {
        const body = {
            query: {
                match_all: {},
            },
            size: 100, // kolik chceš – max 10k
        };
        return this.apiService.getRecords(body).pipe(
            tap({
                next: (data) => {
                    console.log('Statistics data received:', data);
                },
                error: (error) => {
                    console.error('Error loading statistics:', error);
                },
                complete: () => {
                    console.log('Statistics loading complete');
                },
            })
        );
    }
    getRecordsCount(): Observable<any> {
        return this.apiService.getRecordCount();
    }
    getCountByEntityTypes(): Observable<any> {
        const body = {
            size: 0,
            aggs: {
                entity_types: {
                    terms: {
                        field: 'intelectualentity.entitytype.keyword',
                        size: 100,
                    },
                },
            },
        };
        return this.apiService.getRecords(body).pipe(
            map((result: any) =>
                result.aggregations.entity_types.buckets.map((bucket: any) => ({
                    name: bucket.key,
                    value: bucket.doc_count,
                }))
            ),
            catchError((err) => {
                console.error('Error loading entity type counts:', err);
                return throwError(() => err);
            })
        );
    }
    getCountByYears(): Observable<any> {
        const body = {
            size: 0,
            aggs: {
                registrations_over_time: {
                    date_histogram: {
                        field: 'urnnbns.registered',
                        calendar_interval: 'year',
                        format: 'yyyy',
                    },
                },
            },
        };
        return this.apiService.getRecords(body).pipe(
            map((result: any) =>
                result.aggregations.registrations_over_time.buckets.map((b: any) => ({
                    name: b.key_as_string,
                    value: b.doc_count,
                }))
            ),
            catchError((err) => {
                console.error('Error loading date histogram:', err);
                return throwError(() => err);
            })
        );
    }
    getCountByMonths(year: string): Observable<any> {
        const body = {
            size: 0,
            query: {
                range: {
                    'urnnbns.registered': {
                        gte: `${year}-01-01`,
                        lt: `${year}-12-31`,
                    },
                },
            },
            aggs: {
                registrations_over_time: {
                    date_histogram: {
                        field: 'urnnbns.registered',
                        calendar_interval: 'month',
                        format: 'yyyy-MM',
                    },
                },
            },
        };
        return this.apiService.getRecords(body).pipe(
            map((result: any) =>
                result.aggregations.registrations_over_time.buckets.map((b: any) => ({
                    name: b.key_as_string, // "2011-03"
                    value: b.doc_count,
                }))
            )
        );
    }
    getCountByRegistrar(): Observable<any> {
        const body = {
            size: 0,
            aggs: {
                registrar_codes: {
                    terms: {
                        field: 'urnnbns.registrarcode.keyword',
                        size: 100,
                    },
                },
            },
        };
        return this.apiService.getRecords(body).pipe(
            map((res: any) =>
                res.aggregations.registrar_codes.buckets.map((b: any) => ({
                    name: b.key, // registrator code
                    value: b.doc_count,
                }))
            )
        );
    }
    getCountByRegistrarForYear(year: string): Observable<any> {
        const body = {
            size: 0,
            query: {
                range: {
                    'urnnbns.registered': {
                        gte: `${year}-01-01`,
                        lt: `${year}-12-31`,
                    },
                },
            },
            aggs: {
                registrar_codes: {
                    terms: {
                        field: 'urnnbns.registrarcode.keyword',
                        size: 100,
                    },
                },
            },
        };
        return this.apiService.getRecords(body).pipe(
            map((res: any) =>
                res.aggregations.registrar_codes.buckets.map((b: any) => ({
                    name: b.key,
                    value: b.doc_count,
                }))
            )
        );
    }
}
