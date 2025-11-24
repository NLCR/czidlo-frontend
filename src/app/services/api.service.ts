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
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }
    removeUserRights(id: string, registrarId: string) {
        const url = `${this.apiUrl}/users/${id}/registrar_rights/${registrarId}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }
    getUserRights(id: string): Observable<any> {
        const url = `${this.apiUrl}/users/${id}/registrar_rights`;
        return this.doGet(url);
    }

    // ELASTICSEARCH
    getRecords(body: any): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_2/_search';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.post(url, body, { headers }).pipe(tap({
            next: (data) => {
                console.log('Records data received:', data);
            },
            error: (error) => {
                console.error('Error fetching records:', error);
            },
            complete: () => {
                console.log('Records fetch complete');
            },
        }));
    }
    getRecordCount(body?: any): Observable<number> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_2/_count';
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

    getElasticStructure(): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_2/_mapping';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }
    getRecords3(body: any): Observable<any> {
        const url = 'https://es8.dev-service.trinera.cloud/czidlo_registrations_3/_search';
        const login = 'czidlo_reader';
        const password = 'dq7o8rDrXZzhiS20qm';

        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
        });

        return this.http.post(url, body, { headers }).pipe(tap({
            next: (data) => {
                console.log('Records data received:', data);
            },
            error: (error) => {
                console.error('Error fetching records:', error);
            },
            complete: () => {
                console.log('Records fetch complete');
            },
        }));
    }
}
