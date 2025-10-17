import { Injectable, signal } from '@angular/core';
import { environment as staticEnv } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProcessesService {
    public processes = signal<Array<any>>([]);
    public registrators = signal<Array<string>>(['aba001', 'aba004', 'aba006', 'aba007']);
    public intellectualEntities = signal<Array<string>>([
        'MONOGRAPH',
        'MONOGRAPH_VOLUME',
        'PERIODICAL',
        'PERIODICAL_VOLUME',
        'PERIODICAL_ISSUE',
        'THESIS',
        'ANALYTICAL',
        'OTHER',
    ]);
    public identifiers = signal<Array<string>>(['CNB', 'ISSN', 'ISBN']);

    constructor(private apiService: ApiService) {}

    getProcesses(): Observable<any> {
        return this.apiService.getProcesses().pipe(
            tap({
                next: (data) => {
                    console.log('Processes data received:', data);
                    this.processes.set(
                        data.items.map((item: any) => ({
                            id: item.id,
                            type: item.type,
                            ownerLogin: item.ownerLogin,
                            state: item.state,
                            scheduled: item.scheduled ? new Date(item.scheduled?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            started: item.started ? new Date(item.started?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            finished: item.finished ? new Date(item.finished?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            duration: item.finished
                                ? Math.round(
                                      (new Date(item.finished.replace(/\[UTC\]$/, '')).getTime() -
                                          new Date(item.started.replace(/\[UTC\]$/, '')).getTime()) /
                                          1000
                                  ) + ' s'
                                : '---',
                        }))
                    );
                    console.log('Processes loaded:', this.processes());
                },
                error: (error) => {
                    console.error('Error loading processes:', error);
                },
                complete: () => {
                    console.log('Process loading complete');
                },
            })
        );
    }

    getProcess(id: string): Observable<any> {
        return this.apiService.getProcess(id);
    }

    getLog(id: string): Observable<any> {
        return this.apiService.getProcessLog(id);
    }

    getOutput(id: string): Observable<any> {
        return this.apiService.downloadFile(`processes/${id}/output`);
    }

    getProcessesByOwner(owner: string): Observable<any> {
        return this.apiService.getProcessesByOwner(owner).pipe(
            tap({
                next: (data) => {
                    console.log(`Processes data for owner ${owner} received:`, data);
                    if (!data) {
                        console.warn(`No items found for owner ${owner}`);
                        this.processes.set([]);
                        return;
                    }
                    this.processes.set(
                        data.map((item: any) => ({
                            id: item.id,
                            type: item.type,
                            ownerLogin: item.ownerLogin,
                            state: item.state,
                            scheduled: item.scheduled ? new Date(item.scheduled?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            started: item.started ? new Date(item.started?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            finished: item.finished ? new Date(item.finished?.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                            duration: item.finished
                                ? Math.round(
                                      (new Date(item.finished.replace(/\[UTC\]$/, '')).getTime() -
                                          new Date(item.started.replace(/\[UTC\]$/, '')).getTime()) /
                                          1000
                                  ) + ' s'
                                : '---',
                        }))
                    );
                    console.log(`Processes for owner ${owner} loaded:`, this.processes());
                },
                error: (error) => {
                    console.error(`Error loading processes for owner ${owner}:`, error);
                },
                complete: () => {
                    console.log(`Process loading for owner ${owner} complete`);
                },
            })
        );
    }

    deleteProcess(id: string): Observable<any> {
        return this.apiService.deleteProcess(id).pipe(
            tap({
                next: () => {
                    console.log(`Process ${id} deleted`);
                    this.processes.set(this.processes().filter((p) => p.id !== id));
                },
                error: (error) => {
                    console.error(`Error deleting process ${id}:`, error);
                },
                complete: () => {
                    console.log(`Process deletion ${id} complete`);
                },
            })
        );
    }
    killProcess(id: string): Observable<any> {
        return this.apiService.cancelProcess(id).pipe(
            tap({
                next: () => {
                    console.log(`Process ${id} kill requested`);
                },
                error: (error) => {
                    console.error(`Error killing process ${id}:`, error);
                },
                complete: () => {
                    console.log(`Process kill request ${id} complete`);
                },
            })
        );
    }
    cancelProcess(id: string): Observable<any> {
        return this.apiService.cancelProcess(id).pipe(
            tap({
                next: () => {
                    console.log(`Process ${id} cancel requested`);
                },
                error: (error) => {
                    console.error(`Error canceling process ${id}:`, error);
                },
                complete: () => {
                    console.log(`Process cancel request ${id} complete`);
                },
            })
        );
    }
}
