import { Injectable, signal, effect } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private apiUrl: string;
    private infoUrlCz: string; //cz info
    private rulesUrlCz: string; //cz rules
    private contactsUrlCz: string; //cz contacts
    private infoUrlEn: string; //en info
    private rulesUrlEn: string; //en rules
    private contactsUrlEn: string; //en contacts

    constructor(private http: HttpClient, private envService: EnvironmentService, private languageService: LanguageService) {
        this.apiUrl = this.envService.get('czidloApiServiceBaseUrl');

        this.infoUrlCz = this.envService.get('pageInfoCzUrl'); //cz info
        this.rulesUrlCz = this.envService.get('pageRulesCzUrl'); //cz rules
        this.contactsUrlCz = this.envService.get('pageContactsCzUrl'); //cz contacts
        this.infoUrlEn = this.envService.get('pageInfoEnUrl'); //en info
        this.rulesUrlEn = this.envService.get('pageRulesEnUrl'); //en rules
        this.contactsUrlEn = this.envService.get('pageContactsEnUrl'); //en contacts

        effect(() => {
            console.log('🌐 Language changed →', this.languageService.currentLang());
        });
    }

    doGet(url: string, options: any = {}): Observable<Object> {
        return this.http.get(encodeURI(url), options).pipe(catchError(this.handleError));
    }

    private handleError(error: Response) {
        // if (error.status === 404) {
        //     return throwError(() => 'Not found');
        // } else if (error.status === 401 || error.status === 403) {
        //     return throwError(() => 'Unauthorized');
        // }
        return throwError(() => error || 'Server error');
    }

    // ✅ univerzální metoda pro stahování souborů
    downloadFile(endpoint: string): Observable<HttpResponse<Blob>> {
        const url = `${this.apiUrl}/${endpoint}`;
        console.log(`Downloading file from URL: ${url}`);
        return this.http
            .get(url, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(catchError(this.handleError));
    }
    downloadLogFile(url: string) {
        this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = 'system_logs.txt';
            a.click();
            URL.revokeObjectURL(objectUrl);
        });
    }

    // PROCESSES
    getProcesses(): Observable<any> {
        const url = `${this.apiUrl}/processes`;
        return this.doGet(url);
    }
    getProcessesByOwner(owner: string): Observable<any> {
        const url = `${this.apiUrl}/processes/by-owner/${owner}`;
        return this.doGet(url);
    }
    getProcess(id: string): Observable<any> {
        const url = `${this.apiUrl}/processes/${id}`;
        return this.doGet(url);
    }
    getProcessLog(id: string): Observable<any> {
        const url = `${this.apiUrl}/processes/${id}/log`;
        return this.doGet(url, { responseType: 'text' });
    }
    getProcessOutput(id: string): Observable<HttpResponse<Blob>> {
        const url = `${this.apiUrl}/processes/${id}/output`;
        return this.http
            .get(url, {
                responseType: 'blob', // chceme binární data (CSV)
                observe: 'response', // potřebujeme hlavičky
            })
            .pipe(catchError(this.handleError));
    }
    deleteProcess(id: string): Observable<any> {
        const url = `${this.apiUrl}/processes/${id}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    createProcess(body: any): Observable<any> {
        const url = `${this.apiUrl}/processes/`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    cancelProcess(id: string): Observable<any> {
        const url = `${this.apiUrl}/processes/${id}/cancel`;
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }

    // INFO PAGES
    getInfo(): Observable<any> {
        const lang = this.languageService.currentLang();
        const url = lang === 'cs' ? this.infoUrlCz : this.infoUrlEn;
        return this.http.get(url, { responseType: 'text' });
    }

    getRules(): Observable<any> {
        const lang = this.languageService.currentLang();
        const url = lang === 'cs' ? this.rulesUrlCz : this.rulesUrlEn;
        return this.http.get(url, { responseType: 'text' });
    }

    getContact(): Observable<any> {
        const lang = this.languageService.currentLang();
        const url = lang === 'cs' ? this.contactsUrlCz : this.contactsUrlEn;
        return this.http.get(url, { responseType: 'text' });
    }

    // REGISTRARS
    getRegistrars(): Observable<any> {
        const url = `${this.apiUrl}/registrars`;
        return this.doGet(url);
    }
    getRegistrar(code: string): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}`;
        return this.doGet(url);
    }
    deleteRegistrar(code: string): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    createRegistrar(body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    editRegistrar(code: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }

    // CATALOGUES
    createRegistrarCatalogue(code: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/catalogues`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    editRegistrarCatalogue(code: string, catalogId: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/catalogue/${catalogId}`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }
    deleteRegistrarCatalogue(code: string, catalogId: string): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/catalogue/${catalogId}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    // DIGITAL LIBRARIES
    createRegistrarDigitalLibrary(code: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/digital_libraries`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    editRegistrarDigitalLibrary(code: string, dlId: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/digital_libraries/${dlId}`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }
    deleteRegistrarDigitalLibrary(code: string, dlId: string): Observable<any> {
        const url = `${this.apiUrl}/registrars/${code}/digital_libraries/${dlId}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }

    // ARCHIVERS
    getArchivers(): Observable<any> {
        const url = `${this.apiUrl}/archivers`;
        return this.doGet(url);
    }
    getArchiver(id: string): Observable<any> {
        const url = `${this.apiUrl}/archivers/${id}`;
        return this.doGet(url);
    }
    deleteArchiver(id: string): Observable<any> {
        const url = `${this.apiUrl}/archivers/${id}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    createArchiver(body: any): Observable<any> {
        const url = `${this.apiUrl}/archivers`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    editArchiver(id: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/archivers/${id}`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }

    // LOGS
    getLogs(lines?: number | null, minDate?: any, dayAfterMaxDate?: any): Observable<any> {
        console.log('Fetching logs, lines:', lines, minDate, dayAfterMaxDate);
        let url = `${this.apiUrl}/system_logs`;

        if (lines) {
            url += `?maxLines=${lines}`;
            this.doGet(url);
        }
        if (minDate || dayAfterMaxDate) {
            if (minDate) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}minDate=${minDate}`;
            }
            if (dayAfterMaxDate) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}dayAfterMaxDate=${dayAfterMaxDate}`;
            }
            this.downloadLogFile(url);
            return of(null);
        }
        return this.doGet(url, { responseType: 'text' });
    }

    // USERS
    getUsers(): Observable<any> {
        const url = `${this.apiUrl}/users`;
        return this.doGet(url);
    }
    getUser(id: string): Observable<any> {
        const url = `${this.apiUrl}/users/${id}`;
        return this.doGet(url);
    }
    createUser(body: any): Observable<any> {
        const url = `${this.apiUrl}/users`;
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }
    updateUser(id: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/users/${id}`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }
    deleteUser(id: string): Observable<any> {
        const url = `${this.apiUrl}/users/${id}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    updateUserPassword(id: string, body: any): Observable<any> {
        const url = `${this.apiUrl}/users/${id}/password`;
        return this.http.put(url, body).pipe(catchError(this.handleError));
    }
    assignUserRights(id: string, registrarId: string) {
        const url = `${this.apiUrl}/users/${id}/registrar_rights/${registrarId}`;
        return this.http.post(url, {});
    }
    removeUserRights(id: string, registrarId: string) {
        const url = `${this.apiUrl}/users/${id}/registrar_rights/${registrarId}`;
        return this.http.delete(url);
    }
    getUserRights(id: string): Observable<any> {
        const url = `${this.apiUrl}/users/${id}/registrar_rights`;
        return this.doGet(url);
    }

    // DOCUMENTS
    addRecord(record: any): Observable<any> {
        const url = `${this.apiUrl}/documents`;
        return this.http.post(url, record).pipe(catchError(this.handleError));
    }
    getRecordByUrnnbn(urnnbn: string): Observable<any> {
        const url = `${this.apiUrl}/documents/${urnnbn}`;
        return this.doGet(url);
        // return of(this.testRecord).pipe(delay(500));
    }
    editRecordByUrnnbn(urnnbn: string, updatedRecord: any): Observable<any> {
        const url = `${this.apiUrl}/documents/${urnnbn}`;
        return this.http.put(url, updatedRecord).pipe(catchError(this.handleError));
    }
    addDigitalInstance(urnnbn: string, newInstance: any): Observable<any> {
        const url = `${this.apiUrl}/documents/${urnnbn}/instances`;
        return this.http.post(url, newInstance).pipe(catchError(this.handleError));
    }
    editDigitalInstance(instanceId: string, updatedInstance: any): Observable<any> {
        const url = `${this.apiUrl}/instances/${instanceId}`;
        return this.http.put(url, updatedInstance).pipe(catchError(this.handleError));
    }
    deactivateInstance(instanceId: string): Observable<any> {
        const url = `${this.apiUrl}/instances/${instanceId}/deactivation`;
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }
    deactivateUrnNbn(urnnbn: string, reason: string): Observable<any> {
        const url = `${this.apiUrl}/documents/${urnnbn}/deactivation`;
        return this.http.post(url, reason).pipe(catchError(this.handleError));
    }
    reactivateUrnNbn(urnnbn: string): Observable<any> {
        const url = `${this.apiUrl}/documents/${urnnbn}/deactivation`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    deactivateDigitalInstance(instanceId: string): Observable<any> {
        const url = `${this.apiUrl}/instances/${instanceId}/deactivation`;
        return this.http.post(url, null).pipe(catchError(this.handleError));
    }

    // ELASTICSEARCH

    // STATISTICS DATA FOR ASSIGNMENTS
    getStatisticsDataAssign(body: any): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_11/_search';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.post(url, body, { headers }).pipe(
            tap({
                next: (data) => {
                    console.log('Statistics data received:', data);
                },
            })
        );
    }

    // STATISTICS DATA FOR RESOLVATIONS
    getStatisticsDataResolve(body: any): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_9/_search';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.post(url, body, { headers }).pipe(
            tap({
                next: (data) => {
                    console.log('RESOLVED data received:', data);
                },
            })
        );
    }

    // SEARCH RECORDS
    getRecords(body: any): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_10/_search';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.post(url, body, { headers }).pipe(
            tap({
                next: (data) => {
                    console.log('Records data received:', data);
                },
                error: (error) => {
                    console.error('Error fetching records:', error);
                },
                complete: () => {
                    console.log('Records fetch complete');
                },
            })
        );
    }
    getRecordCount(body?: any): Observable<number> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_7/_count';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        if (!body) {
            return this.http.get<any>(url, { headers });
        } else {
            return this.http.post<any>(url, body, { headers });
        }
    }

    testRecord = {
        digitalDocument: {
            id: 3347809,
            urnNbn: {
                value: 'urn:nbn:cz:mzk-005jh2',
                status: 'ACTIVE',
                registrarCode: 'mzk',
                documentCode: '005jh2',
                digitalDocumentId: 64440,
                registered: '2018-07-09T20:26:00.720+02:00',
            },
            created: '2023-05-15T17:33:40.811+02:00',
            monograph: {
                created: '2023-05-15T17:33:40.767+02:00',
                titleInfo: {
                    title: 'Bojujeme s nákazou =',
                    subTitle: '[Wir kämpfen gegen die Ansteckung]',
                },
                ccnb: 'cnb000760137',
                digitalBorn: false,
                primaryOriginator: {
                    type: 'AUTHOR',
                    value: 'Babička, Josef',
                },
                otherOriginator: 'Semerád, Alois',
                publication: {
                    place: 'Praha',
                    year: 1943,
                },
            },
            technicalMetadata: {
                format: {
                    format: 'image/jp2',
                    version: '1.0',
                },
                extent: '144 x JPEG2000',
                resolution: {
                    horizontal: 302,
                    vertical: 302,
                },
                compression: {
                    standard: 'JPEG2000',
                },
                color: {
                    model: 'RGB',
                    depth: 8,
                },
                pictureSize: {
                    width: 1761,
                    height: 2454,
                },
            },
            registrarScopeIdentifiers: [
                {
                    type: 'uuid',
                    value: '9a455640-b41d-11ed-a764-005056827e51',
                },
            ],
            registrar: {
                id: 73,
                code: 'nk',
                name: 'Národní knihovna České republiky',
                created: '2013-01-09T15:40:37.740+01:00',
                modified: '2018-02-28T09:26:22.562+01:00',
                registrationModes: {
                    BY_RESOLVER: true,
                    BY_REGISTRAR: false,
                    BY_RESERVATION: true,
                },
            },
            archiver: {
                id: 45,
                name: 'Národní knihovna České republiky',
                description: 'nk',
                created: '2012-04-18T15:21:37.227+02:00',
                modified: '2014-01-14T12:25:14.994+01:00',
            },
            digitalInstances: [
                {
                    id: 1705917,
                    active: true,
                    url: 'http://www.digitalniknihovna.cz/mzk/uuid/uuid:9a455640-b41d-11ed-a764-005056827e51',
                    format: 'jpg;jp2;pdf',
                    accessibility: 'chráněno autorskými právy',
                    access_restriction: 'UNKNOWN',
                    created: '2023-05-15T20:58:48.841+02:00',
                    digitalLibrary: {
                        id: 29,
                        name: 'Digitální knihovna NK ČR',
                        code: 'DK-NKCR',
                        registrar: {
                            id: 73,
                            code: 'nk',
                            name: 'Národní knihovna České republiky',
                            created: '2013-01-09T15:40:37.740+01:00',
                            modified: '2018-02-28T09:26:22.562+01:00',
                            registrationModes: {
                                BY_RESOLVER: true,
                                BY_REGISTRAR: false,
                                BY_RESERVATION: true,
                            },
                        },
                    },
                },
                {
                    id: 1705916,
                    active: true,
                    url: 'http://kramerius4.nkp.cz/search/handle/uuid:9a455640-b41d-11ed-a764-005056827e51',
                    format: 'jpg;jp2;pdf',
                    accessibility: 'chráněno autorskými právy',
                    access_restriction: 'UNKNOWN',
                    created: '2023-05-15T20:58:47.597+02:00',
                },
            ],
        },
    };
}
