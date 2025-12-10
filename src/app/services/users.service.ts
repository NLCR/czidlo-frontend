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
                    let sortedUsers = data.items.sort((a: any, b: any) => a.login.localeCompare(b.login));
                    this.users.set(sortedUsers.map((item: any) => ({
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
    getCurrentUser(): Observable<any> {
        return this.apiService.getCurrentUser();
    }
    getUser(userId: string): Observable<any> {
        return this.apiService.getUser(userId);
    }
    addUser(userData: any): Observable<any> {
        return this.apiService.createUser(userData);
    }
    updateUser(userId: string, userData: any): Observable<any> {
        return this.apiService.updateUser(userId, userData);
    }
    updateUserPassword(userId: string, passwordData: any): Observable<any> {
        return this.apiService.updateUserPassword(userId, passwordData);
    }
    deleteUser(userId: string): Observable<any> {
        return this.apiService.deleteUser(userId);
    }
    getUserRights(userId: string): Observable<any> {
        return this.apiService.getUserRights(userId);
    }
    assignUserRights(userId: string, code: any): Observable<any> {
        return this.apiService.assignUserRights(userId, code);
    }
    removeUserRights(userId: string, rightsData: any): Observable<any> {
        return this.apiService.removeUserRights(userId, rightsData);
    }
}
