import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, map } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    public loggedIn = signal(false);
    public isAdmin = signal(false);
    public userInfo = signal<any | null>(null);
    public userId = signal<string | null>(null);

    constructor(private http: HttpClient, private envService: EnvironmentService) {
        this.restoreSession(); // 🧠 při startu služby zkusí obnovit přihlášení
    }

    /** Zkontroluje, jestli je uživatel přihlášený */
    isLoggedIn(): Observable<boolean> {
        return of(this.loggedIn());
    }
    isAdministrator(): Observable<boolean> {
        return of(this.isAdmin());
    }
    getUserId(): string | null {
        return this.userId();
    }

    /** Přihlášení uživatele */
    login(username: string, password: string): Observable<boolean> {
        // Reálná přihlašovací logika přes API
        const apiUrl = this.envService.get('czidloApiServiceBaseUrl') + '/user';

        return this.http
            .get(apiUrl, {
                headers: {
                    Authorization: 'Basic ' + btoa(`${username}:${password}`),
                },
            })
            .pipe(
                tap((response) => {
                    console.log('login', response);
                    let admin = response && (response as any).admin === true;
                    this.loggedIn.set(true);
                    this.isAdmin.set(admin);

                    // uložit credentialy
                    localStorage.setItem('auth_username', username);
                    localStorage.setItem('auth_password', password);
                    // user info a id
                    localStorage.setItem('auth_user_info', JSON.stringify(response));
                    localStorage.setItem('auth_user_id', (response as any).id);
                    localStorage.setItem('auth_is_admin', admin ? 'true' : 'false');
                    // expiration
                    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hodin
                    localStorage.setItem('auth_expires_at', expiresAt.toString());
                }),
                map(() => true)
            );
    }

    getCredentials() {
        const username = localStorage.getItem('auth_username');
        const password = localStorage.getItem('auth_password');
        if (!username || !password) return null;
        return { username, password };
    }

    /** Odhlášení uživatele */
    logout(): void {
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_password');
        localStorage.removeItem('auth_is_admin');
        localStorage.removeItem('auth_user_info');
        localStorage.removeItem('auth_expires_at');
        localStorage.removeItem('auth_user_id');

        this.loggedIn.set(false);
        this.isAdmin.set(false);
        this.userInfo.set(null);
        console.log('User logged out');
    }

    /** Vrátí přihlášeného uživatele */
    getUsername(): string | null {
        return this.loggedIn() ? localStorage.getItem('auth_username') : null;
    }

    getUserInfo(): any | null {
        return this.loggedIn() ? JSON.parse(localStorage.getItem('auth_user_info') || 'null') : null;
    }

    hasRightToRegistrar(code: string): boolean {
        return this.loggedIn() ? JSON.parse(localStorage.getItem('auth_user_info') || 'null')?.registrarRights?.includes(code) || this.isAdmin() : false;
    }

    public restoreSession(): void {
        console.log('restoring session with userinfo', localStorage.getItem('auth_user_info'));
        const username = localStorage.getItem('auth_username');
        const password = localStorage.getItem('auth_password');
        const isAdmin = localStorage.getItem('auth_is_admin') === 'true';
        const user = localStorage.getItem('auth_user_info');
        const id = localStorage.getItem('auth_user_id');
        const expiresAt = localStorage.getItem('auth_expires_at');

        if (expiresAt && new Date().getTime() < Number(expiresAt)) {
            if (username && password) {
                this.loggedIn.set(true);
                this.isAdmin.set(isAdmin);
                this.userId.set(id);
                // this.userInfo.set(JSON.parse(user || 'null'));
                console.log('Session restored for user:', user);
            } else {
                this.logout();
            }
        }
    }
}
