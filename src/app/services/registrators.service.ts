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

    // ARCHIVERS
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
    getArchiver(archiverId: string): Observable<any> {
        return this.apiService.getArchiver(archiverId).pipe(
            tap({
                next: (data) => {
                    console.log(`Archiver details for ID ${archiverId} received:`, data);
                },
                error: (error) => {
                    console.error(`Error loading archiver details for ID ${archiverId}:`, error);
                },
                complete: () => {
                    console.log(`Archiver details loading complete for ID ${archiverId}`);
                },
            })
        );
    }
    deleteArchiver(archiverId: string): Observable<any> {
        return this.apiService.deleteArchiver(archiverId).pipe(
            tap({
                next: () => {
                    console.log(`Archiver with ID ${archiverId} deleted successfully`);
                },
                error: (error) => {
                    console.error(`Error deleting archiver with ID ${archiverId}:`, error);
                },
                complete: () => {
                    console.log(`Archiver deletion complete for ID ${archiverId}`);
                },
            })
        );
    }
    createArchiver(body: any): Observable<any> {
        return this.apiService.createArchiver(body);
    }
    editArchiver(id: string, body: any): Observable<any> {
        return this.apiService.editArchiver(id, body);
    }

    // REGISTRATORS

    getRegistrators(): Observable<any> {
        // Implement similarly to getArchivers if needed
        return of([]);
    }

}
