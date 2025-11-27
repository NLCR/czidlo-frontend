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
import { RegistrarsService } from '../../services/registrars.service';
import { FormControl } from '@angular/forms';
import { forkJoin, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    rightsDetails: any = null;

    allRegistrars = signal<Array<any>>([]);
    filteredRegistrars = signal<Array<any>>([]);
    registrars = signal<Array<any>>([]);
    selectedRegistrar = signal<any>(null);
    registrarsControl = new FormControl();
    enrichedCurrentRegistrars = signal<Array<any>>([]);

    isSidebarOpen = signal<boolean>(false);

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private translate: TranslateService,
        private registrarsService: RegistrarsService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.route.url.subscribe((url) => {
            console.log('Route URL changed:', url);
            if (url.length === 2) {
                const userId = url[1].path;
                this.loadUserDetails(userId);
            }
            if (url.length === 3 && url[2].path === 'rights') {
                const userId = url[1].path;
                if (this.activeUser == null || this.activeUser.id !== userId) {
                    this.loadUserDetails(userId);
                }
                this.loadRightsDetails(userId);
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

    loadRegistrars(currentRegistrars: any[]) {
        this.registrarsService.getRegistrars().subscribe({
            next: (response) => {
                this.allRegistrars.set(response.items);
                let filteredRegistars = response.items.filter((reg: any) => {
                    return !currentRegistrars.find((curReg) => curReg === reg.code);
                });
                this.filteredRegistrars.set(filteredRegistars);

                let enrichedRegistrars = currentRegistrars.map((regCode) => {
                    let field = { code: regCode, name: '' };
                    return response.items.find((r: any) => r.code === regCode)
                        ? { code: regCode, name: response.items.find((r: any) => r.code === regCode).name }
                        : field;
                });
                this.enrichedCurrentRegistrars.set(enrichedRegistrars);
            },
        });
    }
    addSelectedRegistrars() {
        const selectedRegs = this.registrarsControl.value || [];
        const selectedCodes = selectedRegs.map((r: any) => r.code);

        if (selectedCodes.length === 0) return;

        // 1) Připravíme si pole requestů – každý vrátí buď {code, success: true}
        //    nebo {code, success: false, error}
        const requests = selectedCodes.map((code: string) =>
            this.usersService.assignUserRights(this.activeUser.id, code).pipe(
                map((res) => ({
                    code,
                    success: true,
                    response: res,
                })),
                catchError((err) =>
                    of({
                        code,
                        success: false,
                        error: err,
                    })
                )
            )
        );
        // 2) Spustíme všechny najednou
        forkJoin(requests).subscribe((results: any) => {
            console.log(results);
            const successes = results.filter((r: any) => r.success);
            const failures = results.filter((r: any) => !r.success);

            // 3) Zpracování úspěšných
            if (successes.length > 0) {
                const currentValues = this.enrichedCurrentRegistrars();
                successes.forEach((s: any) => {
                    const reg = selectedRegs.find((r: any) => r.code === s.code);
                    if (reg) currentValues.push(reg);
                });
                this.enrichedCurrentRegistrars.set([...currentValues]);

                // aktualizace filteredRegistrars
                const updatedFiltered = this.filteredRegistrars().filter((reg) => !successes.find((s: any) => s.code === reg.code));
                this.filteredRegistrars.set(updatedFiltered);

                this._snackBar.open(this.translate.instant('messages.user-rights-updated-successfully'), 'Close', { duration: 2000 });
            }

            // 4) Zpracování chyb
            if (failures.length > 0) {
                const failedCodes = failures.map((f: any) => f.code).join(', ');
                this._snackBar.open(this.translate.instant('messages.error-updating-user-rights') + `: ${failedCodes}`, 'Close');
            }

            // 5) Vyčištění selection
            this.registrarsControl.setValue([]);
        });
    }

    loadRightsDetails(userId: any) {
        console.log('loading rights details for user:', userId);
        this.usersService.getUserRights(userId).subscribe({
            next: (response) => {
                console.log(response, this.activeUser);
                this.rightsDetails = response;
                this.loadRegistrars(response);
                this.isSidebarOpen.set(true);
            },
            error: (error) => {
                console.error('Error loading user rights details:', error);
            },
        });
    }

    removeSelectedRegistrar(item: any) {
        const selectedValues = this.registrarsControl.value || [];
        const index = selectedValues.indexOf(item);
        if (index >= 0) {
            selectedValues.splice(index, 1);
            this.registrarsControl.setValue([...selectedValues]);
        }
    }

    removeCurrentRegistrar(item: any) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'messages.confirm-remove-registrar-right-title',
                data: item,
                warning: 'buttons.confirm-remove',
            },
            maxWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Remove Registrar Right dialog closed:', result);
            if (result === true) {
                this.confirmRemoveCurrentRegistrar(item);
            }
        });
    }

    confirmRemoveCurrentRegistrar(item: any) {
        this.usersService.removeUserRights(this.activeUser.id, item.code).subscribe({
            next: (response) => {
                console.log('User rights updated successfully:', response);
                this._snackBar.open(this.translate.instant('messages.user-rights-updated-successfully'), 'Close', { duration: 2000 });
                this.updateRegistrarListsAfterRemoval(item);
            },
            error: (error) => {
                console.error('Error updating user rights:', error);
                this._snackBar.open(this.translate.instant('messages.error-updating-user-rights'), 'Close', { duration: 2000 });
            },
        });
    }

    updateRegistrarListsAfterRemoval(item: any) {
        const currentValues = this.enrichedCurrentRegistrars();
        const index = currentValues.findIndex((reg) => reg.code === item.code);
        if (index >= 0) {
            currentValues.splice(index, 1);
            this.enrichedCurrentRegistrars.set([...currentValues]);
            const allRegistrars = this.allRegistrars();
            const removedRegistrar = allRegistrars.find((reg) => reg.code === item.code);
            if (removedRegistrar) {
                this.filteredRegistrars.set([...this.filteredRegistrars(), removedRegistrar]);
            }
        }
    }

    openRightsSidebar(user: any) {
        this.router.navigate(['/users', user.id, 'rights']);
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
