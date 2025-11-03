import { Component, signal, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../dialogs/login-dialog/login-dialog.component';
import { LanguageService } from '../services/language.service';

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

    constructor(private authService: AuthService, private dialog: MatDialog, public language: LanguageService) {
        effect(() => {
            console.log('🌐 Aktuální jazyk:', this.language.currentLang());
        });
    }

    ngOnInit() {
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
        this.language.changeLanguage(lang);
        this.toggleLangDropdown();
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
