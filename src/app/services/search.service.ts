import { Injectable, signal } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { id } from '@swimlane/ngx-charts';

@Injectable({ providedIn: 'root' })
export class SearchService {
    query = signal<string>('');
    pageSize = signal<number>(100);
    searchResults = signal<any[]>([]);
    recordsCount = signal<number>(0);
    isLoading = signal<boolean>(false);

    constructor(private apiService: ApiService) { }

    search(term: string, docType?: string, page: number = 1): Observable<any> {
        this.query.set(term);

        const body: any = {
            from: (page - 1) * this.pageSize(),
            size: this.pageSize(),
            query: {
                bool: {
                    must: [],
                    filter: [],
                },
            },
        };

        // 🔍 1) Hledání URNNBN – speciální režim
        if (term.toLowerCase().startsWith('urn:nbn')) {
            let parts = term.split(':');
            let code = parts[parts.length - 1].split('-')[1];
            let registratorCode = parts[parts.length - 1].split('-')[0];
            body.query.bool.must.push({
                match_phrase: {
                    documentcode: code,
                },
            });
            body.query.bool.must.push({
                match_phrase: {
                    registrarcode: registratorCode,
                },
            });
        } else if (term.startsWith('cnb')) {
            // 🔍 2) Hledání CNB – speciální režim
            body.query.bool.must.push({
                match_phrase: {
                    ccnb: term,
                },
            });
        } else {
            body.query.bool.must.push({
                multi_match: {
                    query: term,
                    fields: ['title', 'subtitle', 'volumetitle', 'issuetitle'],
                    type: 'cross_fields',
                    operator: 'and',
                },
            });
        }

        // 🎯 Filtr typu dokumentu
        if (docType) {
            body.query.bool.filter.push({
                term: {
                    'entitytype.keyword': docType,
                },
            });
        }
        console.log('search', body);

        this.isLoading.set(true);

        return this.apiService.getRecords(body).pipe(
            tap({
                next: (data) => {
                    let recordsCount = data.hits.total.value;
                    let results = data.hits.hits.map((hit: any) => ({
                        ...hit._source,
                        urnnbn:
                            hit._source.registrarcode && hit._source.documentcode
                                ? `urn:nbn:cz:${hit._source.registrarcode}-${hit._source.documentcode}`
                                : null,

                    }));

                    this.searchResults.set(results);
                    this.recordsCount.set(recordsCount);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    console.error('Error during search:', error);
                    this.isLoading.set(false);
                },
            })
        );
    }
    getRecordDetails(urnnbn: string): Observable<any> {
        this.apiService.getRecordByUrnnbn(urnnbn).pipe(
            tap({
                next: (data) => {
                    console.log('Record details received for', urnnbn, ':', data);
                },
                error: (error) => {
                    console.error('Error fetching record details for', urnnbn, ':', error);
                },
            })
        );
        return this.apiService.getRecordByUrnnbn(urnnbn);
    }
    addNewInstance(urnnbn: string, newInstance: any): Observable<any> {
        return this.apiService.addDigitalInstance(urnnbn, newInstance).pipe(
            tap({
                next: (data) => {
                    console.log('New instance added to', urnnbn, ':', data);
                },
                error: (error) => {
                    console.error('Error adding new instance to', urnnbn, ':', error);
                },
            })
        );
    }
    editInstance(instanceId: string, updatedInstance: any): Observable<any> {
        return this.apiService.editDigitalInstance(instanceId, updatedInstance)
    }
    deactivateInstance(instanceId: string): Observable<any> {
        return this.apiService.deactivateInstance(instanceId)
    }
    deactivateUrnnbn(urnnbn: string, reason: string): Observable<any> {
        return this.apiService.deactivateUrnNbn(urnnbn, reason);
    }
    reactivateUrnnbn(urnnbn: string): Observable<any> {
        return this.apiService.reactivateUrnNbn(urnnbn);
    }
    deactivateDigitalInstance(instanceId: string): Observable<any> {
        return this.apiService.deactivateDigitalInstance(instanceId);
    }
}
