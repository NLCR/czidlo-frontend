import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { id } from '@swimlane/ngx-charts';

@Injectable({ providedIn: 'root' })
export class SearchService {
    query = signal<string>('');
    searchResults = signal<any[]>([]);
    recordsCount = signal<number>(0);
    isLoading = signal<boolean>(false);

    constructor(private apiService: ApiService) {}

    search(term: string, docType?: string): Observable<any> {
        this.query.set(term);

        const body: any = {
            size: 200,
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
                    'urnnbns.documentcode': code,
                }
            });
            body.query.bool.must.push({
                match_phrase: {
                    'urnnbns.registrarcode': registratorCode,
                },
            });
        } else {
            // 🔍 2) Běžný fulltext
            body.query.bool.must.push({
                match: {
                    'intelectualentity.ieidentifiers.idvalue': term,
                },
            });
        }

        // 🎯 Filtr typu dokumentu
        if (docType) {
            body.query.bool.filter.push({
                term: {
                    'intelectualentity.entitytype.keyword': docType,
                },
            });
        }
        console.log('search', body);

        this.isLoading.set(true);

        return this.apiService.getRecords(body).pipe(
            tap({
                next: (data) => {
                    let results = data.hits.hits.map((hit: any) => ({
                        ...hit._source,
                        title: hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'TITLE')?.idvalue
                            ? hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'TITLE').idvalue
                            : '',
                        subtitle: hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'SUB_TITLE')?.idvalue
                            ? hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'SUB_TITLE').idvalue
                            : '',
                        volume_title: hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'VOLUME_TITLE')?.idvalue
                            ? hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'VOLUME_TITLE').idvalue
                            : '',
                        ie_type: hit._source.intelectualentity?.entitytype,
                        opened: false,
                        ccnb: hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'CCNB')?.idvalue,
                        isbn: hit._source.intelectualentity?.ieidentifiers.find((id: any) => id.type === 'ISBN')?.idvalue,
                        created: hit._source.intelectualentity?.created,
                        modified: hit._source.intelectualentity?.modified,
                    }));
                    let recordsCount = data.hits.total.value;
                    this.searchResults.set(results);
                    this.recordsCount.set(recordsCount);
                    this.isLoading.set(false);
                    console.log('Search results received:', this.searchResults(), this.recordsCount());
                },
                error: (error) => {
                    console.error('Error during search:', error);
                    this.isLoading.set(false);
                }
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
}
