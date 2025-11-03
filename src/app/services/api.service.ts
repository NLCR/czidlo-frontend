import { Injectable, signal, effect } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
        if (error.status === 404) {
            return throwError(() => 'Not found');
        } else if (error.status === 401 || error.status === 403) {
            return throwError(() => 'Unauthorized');
        }
        return throwError(() => 'Server error');
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
    getLogs(lines?: number): Observable<any> {
        console.log('Fetching logs, lines:', lines);

        if (!lines) {
            const url = `${this.apiUrl}/system_logs`;
            this.downloadLogFile(url);
            return of(null);
        }

        const url = `${this.apiUrl}/system_logs?maxLines=${lines}`;
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
    listUserRights(id: string): Observable<any> {
        const url = `${this.apiUrl}/users/${id}/registrar_rights`;
        return this.doGet(url);
    }
}
