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
import { ToggleComponent } from './shared/toggle/toggle.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { LoginDialogComponent } from './dialogs/login-dialog/login-dialog.component';
import { EditArchiverDialogComponent } from './dialogs/edit-archiver-dialog/edit-archiver-dialog.component';
import { CheckboxComponent } from './shared/checkbox/checkbox.component';
import { RadioGroupComponent } from './shared/radio-group/radio-group.component';
import { RadioButtonComponent } from './shared/radio-button/radio-button.component';
import { EditUserComponent } from './dialogs/edit-user/edit-user.component';

// MATERIAL
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// SERVICES
import { EnvironmentService } from './services/environment.service';
import { ApiService } from './services/api.service';
import { ProcessesService } from './services/processes.service';
import { AuthService } from './services/auth.service';
import { RegistratorsService } from './services/registrators.service';
import { UsersService } from './services/users.service';
import { LanguageService } from './services/language.service';

// LOCALE & I18N
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { EditPasswordDialogComponent } from './dialogs/edit-password-dialog/edit-password-dialog.component';

// Překladač
export function HttpLoaderFactory() {
    return new TranslateHttpLoader();
}

registerLocaleData(localeCs);

export function initializeApp(envService: EnvironmentService): () => Promise<any> {
    return async () => {
        return envService.load();
    };
}

// 🎯 Vlastní české formáty (Moment DateAdapter rozumí 'D.M.YYYY')
export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'D.M.YYYY',
    },
    display: {
        dateInput: 'D.M.YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

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
        LoginDialogComponent,
        EditArchiverDialogComponent,
        CheckboxComponent,
        RadioGroupComponent,
        RadioButtonComponent,
        EditUserComponent,
        EditPasswordDialogComponent,
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
        MatMomentDateModule, // 👈 Moment místo Native
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatSnackBarModule,
        FormsModule,
        MatRadioModule,
        MatTooltipModule
    ],
    providers: [
        provideHttpClient(),
        ApiService,
        ProcessesService,
        AuthService,
        RegistratorsService,
        UsersService,
        LanguageService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [EnvironmentService],
            multi: true,
        },
        { provide: LOCALE_ID, useValue: 'cs' },
        { provide: MAT_DATE_LOCALE, useValue: 'cs' },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
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
export class AppModule {
    constructor(private adapter: DateAdapter<any>) {
        // 🔥 Tohle zajistí správné parsování i formátování českých dat
        this.adapter.setLocale('cs');
    }
}
