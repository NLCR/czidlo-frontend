import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private apiUrl: string;
    private infoUrlCz: string; //cz info
    private rulesUrlCz: string; //cz rules
    private contactsUrlCz: string; //cz contacts
    private infoUrlEn: string; //en info
    private rulesUrlEn: string; //en rules
    private contactsUrlEn: string; //en contacts

    constructor(private http: HttpClient, private envService: EnvironmentService) {
        this.apiUrl = this.envService.get('czidloApiServiceBaseUrl');

        this.infoUrlCz = this.envService.get('pageInfoCzUrl'); //cz info
        this.rulesUrlCz = this.envService.get('pageRulesCzUrl'); //cz rules
        this.contactsUrlCz = this.envService.get('pageContactsCzUrl'); //cz contacts

        this.infoUrlEn = this.envService.get('pageInfoEnUrl'); //en info
        this.rulesUrlEn = this.envService.get('pageRulesEnUrl'); //en rules
        this.contactsUrlEn = this.envService.get('pageContactsEnUrl'); //en contacts

        console.log('API URL:', this.apiUrl);
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

    // ✅ univerzální metoda pro stahování souborů
    downloadFile(endpoint: string): Observable<HttpResponse<Blob>> {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.http
            .get(url, {
                responseType: 'blob',
                observe: 'response',
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
        return this.http.get(this.infoUrlCz, { responseType: 'text' });
    }
    getRules(): Observable<any> {
        return this.http.get(this.rulesUrlCz, { responseType: 'text' });
    }
    getContact(): Observable<any> {
        return this.http.get(this.contactsUrlCz, { responseType: 'text' });
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
}
