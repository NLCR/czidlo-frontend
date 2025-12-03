import { Component, signal, effect, computed } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../dialogs/login-dialog/login-dialog.component';
import { LanguageService } from '../services/language.service';
import { EditPasswordDialogComponent } from '../dialogs/edit-password-dialog/edit-password-dialog.component';
import { UsersService } from '../services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
})
export class MenuComponent {
    isLangDropdownOpen = signal(false);
    loggedIn = signal(false);
    isLoggedIn = computed(() => this.authService.loggedIn());
    isAdmin = computed(() => this.authService.isAdmin());
    currentLang: string = '';
    user = '';
    email = '';
    atTop = true;
    atBottom = false;

    userData: any = null;

    isSidebarOpen = signal(false);

    constructor(
        private authService: AuthService,
        private dialog: MatDialog,
        public language: LanguageService,
        private usersService: UsersService,
        private _snackBar: MatSnackBar,
        private translate: TranslateService
    ) {
        effect(() => {
            console.log('🌐 Aktuální jazyk:', this.language.currentLang());
        });
    }

    ngOnInit() {
        this.user = this.authService.getUsername() || '';
        this.authService.isLoggedIn().subscribe((loggedIn) => {
            this.loggedIn.set(loggedIn);
            // this.isAdmin.set(this.authService.isAdmin());
            this.user = this.authService.getUsername() || '';
            // this.email = this.authService.getEmail();
            console.log('menu on init', this.email, this.isAdmin());
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
            this.userData = this.authService.getUserInfo();
            console.log('User data loaded:', this.userData);
            this.isSidebarOpen.set(!this.isSidebarOpen());
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
                    this.userData = this.authService.userInfo();
                    console.log('User logged in:', this.user);
                }
            });
    }

    onLogoutClick() {
        this.authService.logout();
        this.loggedIn.set(false);
        this.user = '';
        this.isSidebarOpen.set(false);
    }

    onScroll(menu: HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        this.atTop = scrollTop === 0;
        this.atBottom = scrollTop + clientHeight >= scrollHeight;
    }

    closeSidebar() {
        this.isSidebarOpen.set(false);
    }

    onChangePasswordClick() {
        console.log('Open change password dialog for user:', this.user);
        const dialogRef = this.dialog.open(EditPasswordDialogComponent, {
            data: {
                password: '',
                login: this.user,
            },
            maxWidth: '800px',
            minWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Change Password dialog closed:', result);
            if (result && result.password) {
                this.usersService.updateUserPassword(this.userData.id, result.password).subscribe({
                    next: (response) => {
                        console.log('Password updated successfully:', response);
                        this._snackBar.open(this.translate.instant('messages.password-updated'), 'Close', { duration: 2000 });
                        this.authService.logout();
                        this.authService.login(this.userData.login, result.password).subscribe(() => {
                            this.loggedIn.set(true);
                        });
                    },
                    error: (error) => {
                        console.error('Error updating password:', error);
                        this._snackBar.open(this.translate.instant('messages.error-updating-password'), 'Close', { duration: 2000 });
                    },
                });
            }
        });
    }
}
