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

    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';
    private readonly EXPIRES_KEY = 'auth_expires_at';

    constructor(private http: HttpClient, private envService: EnvironmentService) {
        this.restoreSession(); // 🧠 při startu služby zkusí obnovit přihlášení
    }

    /** Zkontroluje, jestli je uživatel přihlášený */
    isLoggedIn(): Observable<boolean> {
        return of(this.loggedIn());
    }

    /** Přihlášení uživatele */
    login(username: string, password: string): Observable<boolean> {
        // Simulovaná přihlašovací logika
        // if (username === 'admin' && password === 'password') {
        //     const token = 'fake-jwt-token';
        //     this.setSession(token, username);
        //     this.loggedIn.set(true);
        //     this.isAdmin.set(true);
        //     return of(true).pipe(delay(300));
        // } else if (username === 'user' && password === 'password') {
        //     const token = 'fake-jwt-token';
        //     this.setSession(token, username);
        //     this.loggedIn.set(true);
        //     this.isAdmin.set(false);
        //     return of(true).pipe(delay(300));
        // } else {
        //     return throwError(() => 'Invalid credentials').pipe(delay(300));
        // }

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
                    console.log('login',response);
                    let admin = response && (response as any).admin === true;
                    this.loggedIn.set(true);
                    this.isAdmin.set(admin);
                    console.log('admin', this.isAdmin());
                    this.setSession('', username); // zde by měl být skutečný token z response

                    // uložit credentialy
                    localStorage.setItem('auth_username', username);
                    localStorage.setItem('auth_password', password);
                    localStorage.setItem('auth_is_admin', admin ? 'true' : 'false');
                    localStorage.setItem('auth_user', JSON.stringify(response));
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
        this.loggedIn.set(false);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.EXPIRES_KEY);
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_password');
        localStorage.removeItem('auth_is_admin');
        localStorage.removeItem('auth_user');
        console.log('User logged out');
    }

    /** Vrátí přihlášeného uživatele */
    getUsername(): string | null {
        return this.loggedIn() ? localStorage.getItem('auth_username') : null;
    }

    /** Nastaví session do localStorage na 24 hodin */
    private setSession(token: string, username: string): void {
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hodin
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
    }

    /** Obnoví session z localStorage při startu */
    // private restoreSession(): void {
    //     const token = localStorage.getItem(this.TOKEN_KEY);
    //     const expiresAt = localStorage.getItem(this.EXPIRES_KEY);

    //     if (token && expiresAt && new Date().getTime() < Number(expiresAt)) {
    //         this.loggedIn.set(true);
    //         this.isAdmin.set(localStorage.getItem(this.USER_KEY) === 'admin');
    //         console.log('Session restored for user:', localStorage.getItem(this.USER_KEY));
    //     } else {
    //         this.logout();
    //     }
    // }
    public restoreSession(): void {
    const username = localStorage.getItem('auth_username');
    const password = localStorage.getItem('auth_password');
    const isAdmin = localStorage.getItem('auth_is_admin') === 'true';
    const user = localStorage.getItem('auth_user');

    if (username && password) {
        this.loggedIn.set(true);
        this.isAdmin.set(isAdmin);
        this.userInfo.set(JSON.parse(user || 'null'));
        console.log('Session restored for user:', user);
    } else {
        this.logout();
    }
}
}
