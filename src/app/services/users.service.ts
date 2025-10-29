import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
    public users = signal<Array<any>>([]);

    constructor(private apiService: ApiService) {}

    getUsers(): Observable<any> {
        return this.apiService.getUsers().pipe(
            tap({
                next: (data) => {
                    this.users.set(data.items.map((item: any) => ({
                        id: item.id,
                        login: item.login,
                        email: item.email,
                        admin: item.admin,
                        created: item.created ? new Date(item.created.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                        modified: item.modified ? new Date(item.modified.replace(/\[UTC\]$/, '')).toLocaleString() : '---',
                    })));
                    console.log('Users loaded:', this.users());
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                },
                complete: () => {
                    console.log('Users loading complete');
                },
            })
        );
    }
    getUser(userId: string): Observable<any> {
        return this.apiService.getUser(userId).pipe(
            tap({
                next: (data) => {
                    data.created = data.created ? new Date(data.created.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                    data.modified = data.modified ? new Date(data.modified.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                },
                error: (error) => {
                    console.error(`Error loading user details for ID ${userId}:`, error);
                },
                complete: () => {
                    console.log(`User details loading complete for ID ${userId}`);
                },
            })
        );
    }
    addUser(userData: any): Observable<any> {
        return this.apiService.createUser(userData).pipe(
            tap({
                next: (data) => {
                    console.log('User added successfully:', data);
                },
                error: (error) => {
                    console.error('Error adding user:', error);
                },
                complete: () => {
                    console.log('User addition complete');
                },
            })
        );
    }
}
