import { APP_INITIALIZER, NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, provideHttpClient } from '@angular/common/http';


// COMPONENTS
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { BodyComponent } from './body/body.component';
import { InformationComponent } from './body/information/information.component';
import { RulesComponent } from './body/rules/rules.component';
import { SearchComponent } from './body/search/search.component';
import { RegistratorsComponent } from './body/registrators/registrators.component';
import { StatisticsComponent } from './body/statistics/statistics.component';
import { ImportRecordComponent } from './body/import-record/import-record.component';
import { AdminComponent } from './body/admin/admin.component';
import { ProcessesComponent } from './body/processes/processes.component';
import { LogsComponent } from './body/logs/logs.component';
import { ButtonComponent } from './shared/button/button.component';
import { UsersComponent } from './body/users/users.component';

// MATERIAL
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';


// SERVICES
import { EnvironmentService } from './services/environment.service';
import { ApiService } from './services/api.service';
import { ProcessesService } from './services/processes.service';

// LOCALE & I18N
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { ToggleComponent } from './shared/toggle/toggle.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

// Funkce pro načtení překladových souborů
export function HttpLoaderFactory() {
    return new TranslateHttpLoader();
}

registerLocaleData(localeCs);

export function initializeApp(envService: EnvironmentService): () => Promise<any> {
    return async () => {
        //await envService.load();
        //return authService.checkUserCredentials().toPromise();

        return envService.load();
    };
}

@NgModule({
    declarations: [
        AppComponent,
        MenuComponent,
        BodyComponent,
        InformationComponent,
        RulesComponent,
        SearchComponent,
        RegistratorsComponent,
        StatisticsComponent,
        ImportRecordComponent,
        AdminComponent,
        ProcessesComponent,
        LogsComponent,
        ButtonComponent,
        UsersComponent,
        ToggleComponent,
        ConfirmDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            fallbackLang: 'cs',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
            },
        }),
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatSnackBarModule,
        FormsModule,
        MatRadioModule,
    ],
    providers: [
        provideHttpClient(),
        ApiService,
        ProcessesService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [EnvironmentService],
            multi: true,
        },
        { provide: LOCALE_ID, useValue: 'cs' },
        { provide: MAT_DATE_LOCALE, useValue: 'cs-CZ' },
        {
            provide: TRANSLATE_HTTP_LOADER_CONFIG,
            useValue: {
                prefix: './assets/i18n/',
                suffix: '.json',
            },
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
