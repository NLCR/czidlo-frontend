import { Injectable, signal } from '@angular/core';
import { environment as staticEnv } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RegistratorsService {
    public registrators = signal<Array<any>>([]);
    public archivers = signal<Array<any>>([]);

    constructor(private apiService: ApiService) {}

    getArchivers(): Observable<any> {
        return this.apiService.getArchivers().pipe(
            tap({
                next: (data) => {
                    console.log('Archivers data received:', data);
                    this.archivers.set(data.items);
                    console.log('Archivers loaded:', this.archivers());
                },
                error: (error) => {
                    console.error('Error loading archivers:', error);
                },
                complete: () => {
                    console.log('Archivers loading complete');
                },
            })
        );
    }
    getRegistrators(): Observable<any> {
        // Implement similarly to getArchivers if needed
        return of([]);
    }

}
