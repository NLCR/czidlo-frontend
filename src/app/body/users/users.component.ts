import { Component, signal, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from '../../dialogs/edit-user/edit-user.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditPasswordDialogComponent } from '../../dialogs/edit-password-dialog/edit-password-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-users',
    standalone: false,
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent {
    loggedIn = computed(() => this.authService.loggedIn());

    users = signal<Array<any>>([]);
    activeUser: any = null;

    isSidebarOpen = signal<boolean>(false);

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.route.url.subscribe((url) => {
            console.log('Route URL changed:', url);
            if (url.length === 2) {
                const userId = url[1].path;
                this.loadUserDetails(userId);
            }
        });
    }

    loadUsers() {
        console.log('Loading users...');
        this.usersService.getUsers().subscribe({
            next: (response) => {
                this.users.set(this.usersService.users());
            },
            error: (error) => {
                console.error('Error loading users:', error);
            },
        });
    }

    loadUserDetails(userId: string) {
        this.usersService.getUser(userId).subscribe({
            next: (response) => {
                this.activeUser = response;
                this.isSidebarOpen.set(true);
            },
            error: (error) => {
                console.error('Error loading user details:', error);
            },
        });
    }
    loadRightsDetails(user: any) {
        // TODO: implementovat načtení a zobrazení práv uživatele
        console.log('Loading rights details for user:', user);
    }

    openSidebar(user: any) {
        this.router.navigate(['/users', user.id]);
    }
    closeSidebar() {
        this.router.navigate(['/users']);
    }
    openAddUserDialog() {
        this.dialog
            .open(EditUserComponent, {
                data: {
                    login: '',
                    email: '',
                    isAdmin: false,
                    password: '',
                    action: 'add',
                },
                maxWidth: '800px',
                minWidth: '600px',
            })
            .afterClosed()
            .subscribe((result) => {
                console.log('Add User dialog closed:', result);
                if (result) {
                    this.usersService.addUser(result).subscribe({
                        next: (response) => {
                            console.log('User added successfully:', response);
                            this.loadUsers();
                            this._snackBar.open(this.translate.instant('messages.user-saved-successfully'), 'Close', { duration: 2000 });
                        },
                        error: (error) => {
                            console.error('Error adding user:', error);
                        },
                    });
                }
            });
    }
    openEditUserDialog(user: any) {
        this.dialog
            .open(EditUserComponent, {
                data: {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    isAdmin: user.admin,
                    action: 'edit',
                },
                maxWidth: '800px',
                minWidth: '600px',
            })
            .afterClosed()
            .subscribe((result) => {
                console.log('Edit User dialog closed:', result);
                if (result) {
                    this.usersService.updateUser(user.id, result).subscribe({
                        next: (response) => {
                            console.log('User updated successfully:', response);
                            this.loadUsers();
                            this._snackBar.open(this.translate.instant('messages.user-saved-successfully'), 'Close', { duration: 2000 });
                        },
                        error: (error) => {
                            console.error('Error updating user:', error);
                            this._snackBar.open(this.translate.instant('messages.error-updating-user'), 'Close', { duration: 2000 });
                        },
                    });
                }
            });
    }
    openChangePasswordDialog(user: any) {
        console.log('Open change password dialog for user:', user);
        const dialogRef = this.dialog.open(EditPasswordDialogComponent, {
            data: {
                password: '',
                login: user.login,
            },
            maxWidth: '800px',
            minWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Change Password dialog closed:', result);
            if (result && result.password) {
                this.usersService.updateUserPassword(user.id, result.password).subscribe({
                    next: (response) => {
                        console.log('Password updated successfully:', response);
                        this.loadUsers();
                        this._snackBar.open(this.translate.instant('messages.password-updated-successfully'), 'Close', { duration: 2000 });
                    },
                    error: (error) => {
                        console.error('Error updating password:', error);
                        this._snackBar.open(this.translate.instant('messages.error-updating-password'), 'Close', { duration: 2000 });
                    },
                });
            }
        });
    }
    openDeleteUserDialog(user: any) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'messages.confirm-delete-user-title',
                data: user,
                warning: 'buttons.confirm-delete',
            },
            maxWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Delete User dialog closed:', result);
            if (result === true) {
                this.usersService.deleteUser(user.id).subscribe({
                    next: (response) => {
                        console.log('User deleted successfully:', response);
                        this.loadUsers();
                        this._snackBar.open(this.translate.instant('messages.user-deleted-successfully'), 'Close', { duration: 2000 });
                    },
                    error: (error) => {
                        console.error('Error deleting user:', error);
                        this._snackBar.open(this.translate.instant('messages.error-deleting-user'), 'Close', { duration: 2000 });
                    },
                });
            }
        });
    }
}
