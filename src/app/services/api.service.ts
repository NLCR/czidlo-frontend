import { Injectable } from '@angular/core';
import { environment as staticEnv } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private apiUrl: string;

    constructor(private http: HttpClient) {
        this.apiUrl = staticEnv.czidloApiServiceBaseUrl || 'http://localhost:3000/api'; // Defaultní hodnota
        console.log('API URL:', this.apiUrl);
    }

    doGet(url: string): Observable<Object> {
        return this.http.get(encodeURI(url)).pipe(catchError(this.handleError));
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
}
