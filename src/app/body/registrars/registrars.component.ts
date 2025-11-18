import { Component, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistrarsService } from '../../services/registrars.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditArchiverDialogComponent } from '../../dialogs/edit-archiver-dialog/edit-archiver-dialog.component';
import { EditRegistrarDialogComponent } from '../../dialogs/edit-registrar-dialog/edit-registrar-dialog.component';

@Component({
    selector: 'app-registrars',
    standalone: false,
    templateUrl: './registrars.component.html',
    styleUrl: './registrars.component.scss',
})
export class RegistrarsComponent {
    isActive = 'registrars';
    loadingRegistrars = signal(false);
    loadingArchivers = signal(false);

    loggedIn = computed(() => this.authService.loggedIn());

    registrars = signal<Array<any>>([]);
    archivers = signal<Array<any>>([]);

    isSidebarOpen = signal(false);
    activeRegistrar: any = null;
    activeArchiver: any = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private registrarsService: RegistrarsService,
        private authService: AuthService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.route.url.subscribe((url) => {
            this.isActive = url[1]?.path || 'registrars';
            // REDIRECT TO REGISTRARS IF NO SUBPATH
            if (url.length < 2) {
                this.router.navigate(['/registrars', 'registrars']);
            }
            // REGISTRARS
            if (this.isActive === 'registrars') {
                this.loadingRegistrars.set(true);
                if (this.registrarsService.registrars().length === 0) {
                    console.log('Loading registrars...');
                    this.loadRegistrars();
                } else {
                    this.registrars.set(this.registrarsService.registrars());
                    this.loadingRegistrars.set(false);
                }
                if (url.length === 3) {
                    const registrarId = url[2]?.path;
                    this.activeRegistrar = registrarId;
                    this.loadRegistrarDetails(registrarId);
                }
            }
            // ARCHIVERS
            else if (this.isActive === 'archivers') {
                this.loadingArchivers.set(true);
                if (this.registrarsService.archivers().length === 0) {
                    console.log('Loading archivers...');
                    this.loadArchivers();
                } else {
                    this.archivers.set(this.registrarsService.archivers());
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
        this.registrarsService.getArchivers().subscribe({
            next: (data) => {
                this.archivers.set(this.registrarsService.archivers());
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
        this.registrarsService.getArchiver(archiverId).subscribe({
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

    loadRegistrars(): void {
        this.registrarsService.getRegistrars().subscribe({
            next: (data) => {
                this.registrars.set(this.registrarsService.registrars());
            },
            error: (error) => {
                console.error('Error loading registrars in component:', error);
                this.loadingRegistrars.set(false);
            },
            complete: () => {
                console.log('Registrars loading complete in component');
                this.loadingRegistrars.set(false);
            },
        });
    }
    loadRegistrarDetails(registrarId: any): void {
        this.registrarsService.getRegistrar(registrarId).subscribe({
            next: (data) => {
                console.log(data);
                data.created = data.created ? new Date(data.created.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                data.modified = data.modified ? new Date(data.modified.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                this.activeRegistrar = data;
                this.isSidebarOpen.set(true);
            },
            error: (error) => {
                console.error('Error loading registrar details:', error);
            },
        });
    }

    openSidebar(institution: any): void {
        if (this.isActive === 'archivers') {
            this.router.navigate(['/registrars', 'archivers', institution.id]);
        } else if (this.isActive === 'registrars') {
            this.router.navigate(['/registrars', 'registrars', institution.code]);
        }
    }
    closeSidebar(): void {
        this.router.navigate(['/registrars', this.isActive]);
        this.isSidebarOpen.set(false);
        this.activeArchiver = null;
        this.activeRegistrar = null;
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
                    this.registrarsService.deleteArchiver(archiver.id).subscribe({
                        next: () => {
                            console.log('Archiver deleted successfully');
                            this.loadArchivers();
                        },
                        error: (error) => {
                            console.error('Error deleting archiver:', error);
                        },
                    });
                    this.snackBar.open(this.translate.instant('messages.archiver-deleted-successfully'), this.translate.instant('buttons.close'), {
                        duration: 3000,
                    });
                }
            });
    }

    deleteRegistrar(registrar: any): void {
        console.log('Delete registrar:', registrar);
    }

    openEditRegistrarDialog(registrar?: any): void {
        console.log('Open edit registrar dialog');
        const dialogRef = this.dialog.open(EditRegistrarDialogComponent, {
            minWidth: '800px',
            data: {
                title: registrar
                    ? this.translate.instant('registrars.edit-registrar-title')
                    : this.translate.instant('registrars.add-registrar-title'),
                name: registrar?.name || '',
                code: registrar?.code || '',
                description: registrar?.description || '',
                resolverMode: registrar?.allowedRegistrationModeByResolver || false,
                reserveMode: registrar?.allowedRegistrationModeByReservation || false,
                registrarMode: registrar?.allowedRegistrationModeByRegistrar || false,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Registrar edited/added:', result);
                if (registrar) {
                    // Edit existing registrar
                    this.registrarsService.editRegistrar(registrar.code, result).subscribe({
                        next: () => {
                            console.log('Registrar edited successfully');
                            this.snackBar.open(
                                this.translate.instant('messages.registrar-edited-successfully'),
                                this.translate.instant('buttons.close'),
                                {
                                    duration: 3000,
                                }
                            );
                            this.loadRegistrarDetails(registrar.code);
                            this.loadRegistrars();
                        },
                        error: (error) => {
                            console.error('Error editing registrar:', error);
                        },
                    });
                } else {
                    // Create new registrar
                    this.registrarsService.createRegistrar(result).subscribe({
                        next: () => {
                            console.log('Registrar created successfully');
                            this.loadRegistrars();
                        },
                        error: (error) => {
                            console.error('Error creating registrar:', error);
                        },
                    });
                }
            }
        });
    }

    openEditArchiverDialog(archiver?: any): void {
        console.log('Open edit archiver dialog');
        this.dialog
            .open(EditArchiverDialogComponent, {
                minWidth: '800px',
                data: {
                    title: archiver
                        ? this.translate.instant('registrars.edit-archiver-title')
                        : this.translate.instant('registrars.add-archiver-title'),
                    name: archiver?.name || '',
                    description: archiver?.description || '',
                    hidden: archiver?.hidden || false,
                },
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    console.log('Archiver edited/added:', result);
                    if (archiver) {
                        // Edit existing archiver
                        // result.hidden = archiver.hidden; // preserve history
                        this.registrarsService.editArchiver(archiver.id, result).subscribe({
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
                        this.registrarsService.createArchiver(result).subscribe({
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
    addNewDigitalLibrary(registrarCode: string): void {
        console.log('Add new digital library for registrar:', registrarCode);
    }
    showDetails(registrarCode: string, libraryId: string): void {
        console.log('Show details for registrar:', registrarCode, 'and library:', libraryId);
    }
    addNewCatalogue(registrarCode: string): void {
        console.log('Add new catalogue for registrar:', registrarCode);
    }
    openStatistics(registrarCode: string): void {
        console.log('Open statistics for registrar:', registrarCode);
    }
}
