// basic-auth.interceptor.ts
import { inject, Injectable, computed } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { AuthService } from './auth.service';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    envService = inject(EnvironmentService);
    authService = inject(AuthService);

    // TODO: in production use AuthService to get logged in user credentials
    private readonly loggedIn = computed(() => this.authService.loggedIn());
    // private readonly loggedIn = false;
    private readonly login = 'testUser';
    private readonly password = 'testPassword';

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const credentials = this.authService.getCredentials();
        console.log(this.loggedIn());

        // ignore if user not logged in
        if (!this.loggedIn() || !credentials) {
            return next.handle(req);
        }

        // filter out requests not going to the API
        const czidloApiUrl = this.envService.get('czidloApiServiceBaseUrl');
        if (!req.url.startsWith(czidloApiUrl)) {
            return next.handle(req);
        }

        const basic = btoa(`${credentials?.username}:${credentials?.password}`);
        console.log(`Basic ${basic}`, credentials?.username, credentials?.password);

        const authReq = req.clone({
            setHeaders: {
                Authorization: `Basic ${basic}`,
            },
        });
        return next.handle(authReq);
    }
}
