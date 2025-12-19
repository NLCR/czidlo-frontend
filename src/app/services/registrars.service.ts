import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';


@Injectable({ providedIn: 'root' })
export class RegistrarsService {
    public registrars = signal<Array<any>>([]);
    public archivers = signal<Array<any>>([]);

    constructor(private apiService: ApiService) {}

    // ARCHIVERS
    getArchivers(): Observable<any> {
        return this.apiService.getArchivers().pipe(
            tap({
                next: (data) => {
                    console.log('Archivers data received:', data);
                    let sortedItems = data.items.sort((a: any, b: any) => a.name.localeCompare(b.name));
                    this.archivers.set(sortedItems);
                    // console.log('Archivers loaded:', this.archivers());
                },
                error: (error) => {
                    console.error('Error loading archivers:', error);
                },
                complete: () => {
                    // console.log('Archivers loading complete');
                },
            })
        );
    }
    getArchiver(archiverId: string): Observable<any> {
        return this.apiService.getArchiver(archiverId);
    }
    deleteArchiver(archiverId: string): Observable<any> {
        return this.apiService.deleteArchiver(archiverId);
    }
    createArchiver(body: any): Observable<any> {
        return this.apiService.createArchiver(body);
    }
    editArchiver(id: string, body: any): Observable<any> {
        return this.apiService.editArchiver(id, body);
    }

    // REGISTRARS

    getRegistrars(): Observable<any> {
        return this.apiService.getRegistrars().pipe(
            tap({
                next: (data) => {
                    let sortedItems = data.items.sort((a: any, b: any) => a.code.localeCompare(b.code));
                    this.registrars.set(sortedItems);
                },
                error: (error) => {
                    console.error('Error loading registrars:', error);
                },
                complete: () => {
                    console.log('Registrars loading complete');
                },
            })
        );
    }
    getRegistrar(code: string): Observable<any> {
        return this.apiService.getRegistrar(code);
    }
    deleteRegistrar(registrarId: string): Observable<any> {
        return this.apiService.deleteRegistrar(registrarId);
    }
    createRegistrar(body: any): Observable<any> {
        return this.apiService.createRegistrar(body);
    }
    editRegistrar(id: string, body: any): Observable<any> {
        return this.apiService.editRegistrar(id, body);
    }

    // RIGHTS


    // DIGITAL LIBRARIES AND CATALOGUES
    createDigitalLibrary(registrarCode: string, body: any): Observable<any> {
        return this.apiService.createRegistrarDigitalLibrary(registrarCode, body);
    }
    editDigitalLibrary(registrarCode: string, dlId: string, body: any): Observable<any> {
        return this.apiService.editRegistrarDigitalLibrary(registrarCode, dlId, body);
    }
    deleteDigitalLibrary(registrarCode: string, dlId: string): Observable<any> {
        return this.apiService.deleteRegistrarDigitalLibrary(registrarCode, dlId);
    }
    createCatalogue(registrarCode: string, body: any): Observable<any> {
        return this.apiService.createRegistrarCatalogue(registrarCode, body);
    }
    editCatalogue(registrarCode: string, catalogId: string, body: any): Observable<any> {
        return this.apiService.editRegistrarCatalogue(registrarCode, catalogId, body);
    }
    deleteCatalogue(registrarCode: string, catalogId: string): Observable<any> {
        return this.apiService.deleteRegistrarCatalogue(registrarCode, catalogId);
    }

    getDigitalLibrariesByRegistrar(registrarCode: string): Observable<any> {
        return this.apiService.getRegistrar(registrarCode);
    }
}
