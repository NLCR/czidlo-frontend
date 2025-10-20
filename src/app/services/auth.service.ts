import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })

export class AuthService {
    public loggedIn = signal(false);

    constructor(private http: HttpClient, private envService: EnvironmentService) {}

    isLoggedIn(): Observable<boolean> {
        // Simulovaná kontrola přihlášení (v reálné aplikaci by zde byla logika pro ověření tokenu nebo session)
        return of(this.loggedIn()).pipe(
            delay(500), // Simulace zpoždění
            tap((status) => console.log('User logged in status:', status))
        );
    }

    login(username: string, password: string): Observable<boolean> {
        // Simulovaná přihlašovací logika (v reálné aplikaci by zde byla volání API)
        if (username === 'admin' && password === 'password') {
            this.loggedIn.set(true);
            return of(true).pipe(delay(500));
        } else {
            return throwError(() => 'Invalid credentials').pipe(delay(500));
        }
    }
    logout(): void {
        this.loggedIn.set(false);
        console.log('User logged out');
    }

    getUsername(): string | null {
        // Simulovaná logika pro získání uživatelského jména (v reálné aplikaci by zde byla logika pro získání z tokenu nebo session)
        return this.loggedIn() ? 'admin' : null;
    }
}
