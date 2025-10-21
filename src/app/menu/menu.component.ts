import { Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../dialogs/login-dialog/login-dialog.component';

@Component({
    selector: 'app-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
})
export class MenuComponent {
    isLangDropdownOpen = signal(false);
    loggedIn = signal(false);
    currentLang: string = '';
    user = '';
    atTop = true;
    atBottom = false;

    constructor(private translate: TranslateService, private authService: AuthService, private dialog: MatDialog) {
        this.currentLang = this.translate.getCurrentLang() || localStorage.getItem('lang') || 'cs';
        this.translate.use(this.currentLang);
        console.log('CurrentLang', this.currentLang);
    }

    ngOnInit() {
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
            this.currentLang = savedLang;
        }

        this.user = this.authService.getUsername() || '';
        this.authService.isLoggedIn().subscribe((loggedIn) => {
            this.loggedIn.set(loggedIn);
            this.user = this.authService.getUsername() || '';
        });
    }

    toggleLangDropdown() {
        this.isLangDropdownOpen.set(!this.isLangDropdownOpen());
    }
    changeLanguage(lang: string) {
        console.log('changeLanguage', lang);
        this.translate.use(lang);
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.toggleLangDropdown();
        console.log(this.isLangDropdownOpen());
    }
    onLoginClick() {
        if (this.loggedIn()) {
            return;
        }
        this.dialog
            .open(LoginDialogComponent, {
                minWidth: '600px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.loggedIn.set(true);
                    this.user = this.authService.getUsername() || '';
                }
            });
    }

    onLogoutClick() {
        this.authService.logout();
        this.loggedIn.set(false);
        this.user = '';
    }

    onScroll(menu: HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        this.atTop = scrollTop === 0;
        this.atBottom = scrollTop + clientHeight >= scrollHeight;
    }
}
