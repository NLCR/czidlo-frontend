import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { RegistrarsService } from '../services/registrars.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
    registrars = computed(() => this.registrarsService.registrars());
    registrars$: Observable<Array<any>>;

    constructor(private apiService: ApiService, private registrarsService: RegistrarsService) {
        this.registrars$ = toObservable(this.registrarsService.registrars);
    }

    // REGISTRACE URNNBN PODLE ROKU
    getCountByDate(registrar?: any, year?: any, state?: string, type?: string): Observable<any> {
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

        // pokud je filtrován stav
        if (state && state !== 'all') {
            const isActive = state === 'active';
            filters.push({
                term: {
                    active: isActive,
                },
            });
        }

        // pokud je filtrován typ entity
        if (type) {
            filters.push({
                term: {
                    'entitytype.keyword': type,
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

        return this.apiService.getStatisticsDataAssign(body).pipe(
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
    getCountByRegistrar(registrar?: string, year?: string, state?: string, type?: string): Observable<any> {
        console.log('getCountByRegistrar', registrar, year, state, type);
        const query: any = {
            bool: {
                filter: [], // efektivnější než must
            },
        };

        // pokud je filtr registrar
        if (registrar) {
            query.bool.filter.push({
                term: {
                    'registrarcode.keyword': registrar,
                },
            });
        }

        // pokud je filtrován typ entity
        if (type) {
            query.bool.filter.push({
                term: {
                    'entitytype.keyword': type,
                },
            });
        }

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
        // pokud je filtrován stav
        if (state && state !== 'all') {
            const isActive = state === 'active';
            query.bool.filter.push({
                term: {
                    active: isActive,
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
        if (registrar || year || (state && state !== 'all') || type) {
            body.query = query;
        }


        return combineLatest([this.registrars$, this.apiService.getStatisticsDataAssign(body)]).pipe(
            map(([registrars, res]) =>
                res.aggregations.registrar_codes.buckets.map((b: any) => {
                    const r = registrars.find((reg) => reg.code === b.key);
                    return {
                        name: b.key,
                        title: r ? r.name : b.key,
                        value: b.doc_count,
                    };
                })
            )
        );
    }

    // REGISTRACE URNNBN PODLE TYPŮ V ZADANÉM ROCE A PRO ZADANÉHO REGISTRÁTORA
    getCountByEntityTypes(registrar?: string, year?: string, state?: string, type?: string): Observable<any> {

        const query: any = {
            bool: {
                must: [
                ],
            },
        };

        // Pokud je zadaný registrátor → přidáme term filtr
        if (registrar) {
            query.bool.must.push({
                term: {
                    'registrarcode.keyword': registrar,
                },
            });
        }

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

        // pokud je filtrován stav
        if (state && state !== 'all') {
            const isActive = state === 'active';
            query.bool.must.push({
                term: {
                    active: isActive,
                },
            });
        }


        // pokud je filtrován typ entity
        if (type) {
            query.bool.must.push({
                term: {
                    'entitytype.keyword': type,
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

        return this.apiService.getStatisticsDataAssign(body).pipe(
            map((result: any) =>
                result.aggregations.entity_types.buckets.map((bucket: any) => ({
                    name:  bucket.key,
                    value: bucket.doc_count,
                }))
            ),
            catchError((err) => {
                console.error('Error loading entity type counts:', err);
                return throwError(() => err);
            })
        );
    }

    // RESOLVOVANI PODLE ROKU
    getResolvedByDate(registrar?: string, year?: string): Observable<any> {
        console.log('getResolvedByDATE', registrar, year);
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
                    resolved: {
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
                resolved_over_time: {
                    date_histogram: {
                        field: 'resolved',
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

        return this.apiService.getStatisticsDataResolve(body).pipe(
            map((result: any) => {
                console.log(result);
                return result.aggregations.resolved_over_time.buckets.map((b: any) => ({
                    name: b.key_as_string,
                    value: b.doc_count,
                }));
            })
        );
    }

    // RESOLVOVANI PODLE REGISTRÁTORŮ
    getResolvedByRegistrar(year?: string): Observable<any> {
        const query: any = {
            bool: {
                filter: [], // efektivnější než must
            },
        };

        // pokud mám rok → přidám range
        if (year) {
            query.bool.filter.push({
                range: {
                    resolved: {
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

        return this.apiService.getStatisticsDataResolve(body).pipe(
            map((result: any) => {
                console.log('RGISTRARS', result);
                return result.aggregations.registrar_codes.buckets.map((b: any) => ({
                    name: b.key,
                    value: b.doc_count,
                }));
            })
        );
    }

    // FOR TESTING PURPOSES ONLY
    getRecords(): Observable<any> {
        let body: any = {
            size: 100,
            query: {
                match_all: {},
            },
        };
        return this.apiService.getStatisticsDataAssign(body);
    }
}
