import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    public loggedIn = signal(false);

    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';
    private readonly EXPIRES_KEY = 'auth_expires_at';

    constructor(private http: HttpClient, private envService: EnvironmentService) {
        this.restoreSession(); // 🧠 při startu služby zkusí obnovit přihlášení
    }

    /** Zkontroluje, jestli je uživatel přihlášený */
    isLoggedIn(): Observable<boolean> {
        const logged = this.loggedIn();
        return of(logged).pipe(
            delay(300),
            tap((status) => console.log('User logged in status:', status))
        );
    }

    /** Přihlášení uživatele */
    login(username: string, password: string): Observable<boolean> {
        // Simulovaná přihlašovací logika
        if (username === 'admin' && password === 'password') {
            const token = 'fake-jwt-token';
            this.setSession(token, username);
            this.loggedIn.set(true);
            return of(true).pipe(delay(300));
        } else {
            return throwError(() => 'Invalid credentials').pipe(delay(300));
        }
    }

    /** Odhlášení uživatele */
    logout(): void {
        this.loggedIn.set(false);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.EXPIRES_KEY);
        console.log('User logged out');
    }

    /** Vrátí přihlášeného uživatele */
    getUsername(): string | null {
        return this.loggedIn() ? localStorage.getItem(this.USER_KEY) : null;
    }

    /** Nastaví session do localStorage na 24 hodin */
    private setSession(token: string, username: string): void {
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hodin
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, username);
        localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
    }

    /** Obnoví session z localStorage při startu */
    private restoreSession(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const expiresAt = localStorage.getItem(this.EXPIRES_KEY);

        if (token && expiresAt && new Date().getTime() < Number(expiresAt)) {
            this.loggedIn.set(true);
            console.log('Session restored for user:', localStorage.getItem(this.USER_KEY));
        } else {
            this.logout();
        }
    }
}
