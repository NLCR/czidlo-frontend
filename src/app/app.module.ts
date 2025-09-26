import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { BodyComponent } from './body/body.component';
import { EnvironmentService } from './services/environment.service';

export function initializeApp(envService: EnvironmentService): () => Promise<any> {
    return async () => {
        //await envService.load();
        //return authService.checkUserCredentials().toPromise();

        return envService.load();
    };
}

@NgModule({
    declarations: [AppComponent, MenuComponent, BodyComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [
        provideAppInitializer(() => {
            const configService = inject(ConfigService);
            return configService.loadConfig();
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [EnvironmentService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
