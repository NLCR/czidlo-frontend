import { Component, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistratorsService } from '../../services/registrators.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditArchiverDialogComponent } from '../../dialogs/edit-archiver-dialog/edit-archiver-dialog.component';

@Component({
    selector: 'app-registrators',
    standalone: false,
    templateUrl: './registrators.component.html',
    styleUrl: './registrators.component.scss',
})
export class RegistratorsComponent {
    isActive = 'registrators';
    loadingRegistrators = signal(false);
    loadingArchivers = signal(false);

    loggedIn = computed(() => this.authService.loggedIn());

    registrators = signal<Array<any>>([]);
    archivers = signal<Array<any>>([]);

    isSidebarOpen = signal(false);
    activeRegistrator: any = null;
    activeArchiver: any = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private registratorsService: RegistratorsService,
        private authService: AuthService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.route.url.subscribe((url) => {
            this.isActive = url[1]?.path || 'registrators';
            // REDIRECT TO REGISTRATORS IF NO SUBPATH
            if (url.length < 2) {
                this.router.navigate(['/registrators', 'registrators']);
            }
            // REGISTRATORS
            if (this.isActive === 'registrators') {
                this.loadingRegistrators.set(true);
                if (this.registratorsService.registrators().length === 0) {
                    console.log('Loading registrators...');
                    this.loadRegistrators();
                } else {
                    this.registrators.set(this.registratorsService.registrators());
                    this.loadingRegistrators.set(false);
                }
            }
            // ARCHIVERS
            else if (this.isActive === 'archivers') {
                this.loadingArchivers.set(true);
                if (this.registratorsService.archivers().length === 0) {
                    console.log('Loading archivers...');
                    this.loadArchivers();
                } else {
                    this.archivers.set(this.registratorsService.archivers());
                    this.loadingArchivers.set(false);
                }
                if (url.length === 3) {
                    const archiverId = url[2]?.path;
                    this.activeArchiver = archiverId;
                    this.loadArchiverDetails(archiverId);
                }
            }
        });
    }

    loadArchivers(): void {
        this.registratorsService.getArchivers().subscribe({
            next: (data) => {
                this.archivers.set(this.registratorsService.archivers());
            },
            error: (error) => {
                console.error('Error loading archivers in component:', error);
                this.loadingArchivers.set(false);
            },
            complete: () => {
                console.log('Archivers loading complete in component');
                this.loadingArchivers.set(false);
            },
        });
    }
    loadArchiverDetails(archiverId: any): void {
        this.registratorsService.getArchiver(archiverId).subscribe({
            next: (data) => {
                data.created = data.created ? new Date(data.created.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                data.modified = data.modified ? new Date(data.modified.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                this.activeArchiver = data;
                this.isSidebarOpen.set(true);
            },
            error: (error) => {
                console.error('Error loading archiver details:', error);
            },
        });
    }

    loadRegistrators(): void {
        this.registratorsService.getRegistrators().subscribe({
            next: (data) => {
                this.registrators.set(this.registratorsService.registrators());
            },
            error: (error) => {
                console.error('Error loading registrators in component:', error);
                this.loadingRegistrators.set(false);
            },
            complete: () => {
                console.log('Registrators loading complete in component');
                this.loadingRegistrators.set(false);
            },
        });
    }

    openSidebar(institution: any): void {
        if (this.isActive === 'archivers') {
            this.router.navigate(['/registrators', 'archivers', institution.id]);
        } else if (this.isActive === 'registrators') {
            this.router.navigate(['/registrators', 'registrators', institution.id]);
        }
    }
    closeSidebar(): void {
        this.router.navigate(['/registrators', this.isActive]);
        this.isSidebarOpen.set(false);
        this.activeArchiver = null;
        this.activeRegistrator = null;
    }
    deleteArchiver(archiver: any): void {
        console.log('Delete archiver:', archiver);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: archiver,
                    title: this.translate.instant('messages.confirm-delete-archiver-title', { name: archiver.name }),
                    warning: this.translate.instant('buttons.confirm-delete'),
                    // message: this.translate.instant('messages.confirm-delete-message', { name: archiver.name }),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.registratorsService.deleteArchiver(archiver.id).subscribe({
                        next: () => {
                            console.log('Archiver deleted successfully');
                            this.loadArchivers();
                        },
                        error: (error) => {
                            console.error('Error deleting archiver:', error);
                        },
                    });
                    this.snackBar.open(this.translate.instant('messages.boooooom'), this.translate.instant('buttons.close'), { duration: 3000 });
                }
            });
    }

    deleteRegistrator(registrator: any): void {
        console.log('Delete registrator:', registrator);
    }

    openAddRegistratorDialog(): void {
        console.log('Open add registrator dialog');
    }

    openEditArchiverDialog(archiver?: any): void {
        console.log('Open edit archiver dialog');
        this.dialog.open(EditArchiverDialogComponent, {
            minWidth: '800px',
            data: {
                title: archiver ? this.translate.instant('registrators.edit-archiver-title') : this.translate.instant('registrators.add-archiver-title'),
                name: archiver?.name || '',
                description: archiver?.description || '',
            },
        }).afterClosed().subscribe(result => {
            if (result) {
                console.log('Archiver edited/added:', result);
                if (archiver) {
                    // Edit existing archiver
                    result.hidden = archiver.hidden; // preserve history
                    this.registratorsService.editArchiver(archiver.id, result).subscribe({
                        next: () => {
                            console.log('Archiver edited successfully');
                            this.loadArchivers();
                        },
                        error: (error) => {
                            console.error('Error editing archiver:', error);
                        },
                    });
                } else {
                    // Create new archiver
                    this.registratorsService.createArchiver(result).subscribe({
                        next: () => {
                            console.log('Archiver created successfully');
                            this.loadArchivers();
                        },
                        error: (error) => {
                            console.error('Error creating archiver:', error);
                        },
                    });
                }
            }
        });
    }
}
