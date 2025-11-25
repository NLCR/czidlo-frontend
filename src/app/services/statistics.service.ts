import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
    constructor(private apiService: ApiService) {}

    // REGISTRACE URNNBN PODLE ROKU
    getCountByDate(registrar?: any, year?: any): Observable<any> {
        const filters: any[] = [];

        // pokud je filtr registrar
        if (registrar) {
            filters.push({
                term: {
                    'registrarcode.keyword': registrar,
                },
            });
        }

        // pokud je filtrován rok
        if (year) {
            filters.push({
                range: {
                    registered: {
                        gte: `${year}-01-01`,
                        lt: `${year}-12-31`,
                    },
                },
            });
        }

        // vyber datový interval podle toho, jestli máme rok
        const interval = year ? 'month' : 'year';
        const format = year ? 'yyyy-MM' : 'yyyy';

        const body: any = {
            size: 0,
            aggs: {
                registrations_over_time: {
                    date_histogram: {
                        field: 'registered',
                        calendar_interval: interval,
                        format: format,
                    },
                },
            },
        };

        // pokud existují filtry, přidej query
        if (filters.length > 0) {
            body.query = {
                bool: {
                    filter: filters,
                },
            };
        }

        return this.apiService.getStatisticsDataReg(body).pipe(
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

    // REGISTRACE URNNBN PODLE REGISTRÁTORŮ
    getCountByRegistrar(year?: string): Observable<any> {
        const query: any = {
            bool: {
                filter: [], // efektivnější než must
            },
        };

        // pokud mám rok → přidám range
        if (year) {
            query.bool.filter.push({
                range: {
                    registered: {
                        gte: `${year}-01-01`,
                        lt: `${year}-12-31`,
                    },
                },
            });
        }

        const body: any = {
            size: 0,
            aggs: {
                registrar_codes: {
                    terms: {
                        field: 'registrarcode.keyword',
                        size: 1000,
                    },
                },
            },
        };

        // query přidáme jen pokud existuje filtr (rok)
        if (year) {
            body.query = query;
        }

        return this.apiService.getStatisticsDataReg(body).pipe(
            map((res: any) =>
                res.aggregations.registrar_codes.buckets.map((b: any) => ({
                    name: b.key,
                    value: b.doc_count,
                }))
            )
        );
    }

    // REGISTRACE URNNBN PODLE TYPŮ V ZADANÉM ROCE A PRO ZADANÉHO REGISTRÁTORA
    getCountByEntityTypes(registrar: string, year?: string): Observable<any> {
        const query: any = {
            bool: {
                must: [
                    {
                        term: {
                            'registrarcode.keyword': registrar,
                        },
                    },
                ],
            },
        };

        // Pokud je zadaný rok → přidáme range filtr
        if (year) {
            query.bool.must.push({
                range: {
                    registered: {
                        gte: `${year}-01-01`,
                        lt: `${year}-12-31`,
                    },
                },
            });
        }

        const body = {
            size: 0,
            query,
            aggs: {
                entity_types: {
                    terms: {
                        field: 'entitytype.keyword',
                        size: 100,
                    },
                },
            },
        };

        return this.apiService.getStatisticsDataReg(body).pipe(
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

    getRecords(): Observable<any> {
        const body = {
            query: {
                match_all: {},
            },
            size: 1000, // kolik chceš – max 10k
        };
        return this.apiService.getStatisticsDataReg(body).pipe(
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
}
