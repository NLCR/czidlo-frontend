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
import { DetailDialogComponent } from '../../dialogs/detail-dialog/detail-dialog.component';
import { EditDlCatalogDialogComponent } from '../../dialogs/edit-dl-catalog-dialog/edit-dl-catalog-dialog.component';

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
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: registrar,
                    title: this.translate.instant('messages.confirm-delete-registrar-title', { name: registrar.name }),
                    warning: this.translate.instant('buttons.confirm-delete'),
                    // message: this.translate.instant('messages.confirm-delete-message', { name: registrar.name }),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.registrarsService.deleteRegistrar(registrar.code).subscribe({
                        next: () => {
                            console.log('Registrar deleted successfully');
                            this.loadRegistrars();
                        },
                        error: (error) => {
                            console.error('Error deleting registrar:', error);
                        },
                    });
                    this.snackBar.open(this.translate.instant('messages.registrar-deleted-successfully'), this.translate.instant('buttons.close'), {
                        duration: 3000,
                    });
                }
            });
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
        const dialogRef = this.dialog.open(EditDlCatalogDialogComponent, {
            minWidth: '800px',
            data: {
                context: 'dl',
                title: this.translate.instant('registrars.add-digital-library-title'),
                name: '',
                url: '',
                description: '',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('New digital library data:', result);
                this.registrarsService.createDigitalLibrary(registrarCode, result).subscribe({
                    next: () => {
                        console.log('Digital library created successfully');
                        this.loadRegistrarDetails(registrarCode);
                    },
                    error: (error) => {
                        console.error('Error creating digital library:', error);
                        this.snackBar.open(
                            this.translate.instant('messages.' + error?.error?.message || 'digital-library-creation-failed'),
                            this.translate.instant('buttons.close'),
                            {
                                duration: 3000,
                            }
                        );
                    },
                });
           }
        });
    }
    editDigitalLibrary(registrarCode: string, library: any): void {
        console.log('Edit digital library:', library, 'for registrar:', registrarCode);
        const dialogRef = this.dialog.open(EditDlCatalogDialogComponent, {
            minWidth: '800px',
            data: {
                context: 'dl',
                title: this.translate.instant('registrars.edit-digital-library-title'),
                name: library.name,
                url: library.url,
                description: library.description,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Edited digital library data:', result);
                this.registrarsService.editDigitalLibrary(registrarCode, library.id, result).subscribe({
                    next: () => {
                        console.log('Digital library edited successfully');
                        this.loadRegistrarDetails(registrarCode);
                    },
                    error: (error) => {
                        console.error('Error editing digital library:', error);
                        this.snackBar.open(
                            this.translate.instant('messages.' + error?.error?.message || 'digital-library-edit-failed'),
                            this.translate.instant('buttons.close'),
                            {
                                duration: 3000,
                            }
                        );
                    },
                });
            }
        });
    }
    deleteDigitalLibrary(registrarCode: string, library: any): void {
        console.log('Delete digital library:', library, 'for registrar:', registrarCode);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: library,
                    title: this.translate.instant('messages.confirm-delete-digital-library-title', { name: library.name }),
                    warning: this.translate.instant('buttons.confirm-delete'),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.registrarsService.deleteDigitalLibrary(registrarCode, library.id).subscribe({
                        next: () => {
                            console.log('Digital library deleted successfully');
                            this.loadRegistrarDetails(registrarCode);
                        },
                        error: (error) => {
                            console.error('Error deleting digital library:', error);
                        },
                    });
                    this.snackBar.open(
                        this.translate.instant('messages.digital-library-deleted-successfully'),
                        this.translate.instant('buttons.close'),
                        {
                            duration: 3000,
                        }
                    );
                }
            });
    }
    addNewCatalogue(registrarCode: string): void {
        console.log('Add new catalogue for registrar:', registrarCode);
        const dialogRef = this.dialog.open(EditDlCatalogDialogComponent, {
            minWidth: '800px',
            data: {
                context: 'catalogue',
                title: this.translate.instant('registrars.add-catalogue-title'),
                name: '',
                urlPrefix: '',
                description: '',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('New catalogue data:', result);
                this.registrarsService.createCatalogue(registrarCode, result).subscribe({
                    next: () => {
                        console.log('Catalogue created successfully');
                        this.loadRegistrarDetails(registrarCode);
                    },
                    error: (error) => {
                        console.error('Error creating catalogue:', error);
                        this.snackBar.open(
                            this.translate.instant('messages.' + error?.error?.message || 'catalogue-creation-failed'),
                            this.translate.instant('buttons.close'),
                            {
                                duration: 3000,
                            }
                        );
                    },
                });
            }
        });
    }
    editCatalogue(registrarCode: string, catalog: any): void {
        console.log('Edit catalogue:', catalog, 'for registrar:', registrarCode);
        const dialogRef = this.dialog.open(EditDlCatalogDialogComponent, {
            minWidth: '800px',
            data: {
                context: 'catalogue',
                title: this.translate.instant('registrars.edit-catalogue-title'),
                name: catalog.name,
                urlPrefix: catalog.urlPrefix,
                description: catalog.description,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Edited catalogue data:', result);
                let body = {name: result.name, description: result.description, urlPrefix: result.urlPrefix};
                this.registrarsService.editCatalogue(registrarCode, catalog.id, body).subscribe({
                    next: () => {
                        console.log('Catalogue edited successfully');
                        this.loadRegistrarDetails(registrarCode);
                    },
                    error: (error) => {
                        console.error('Error editing catalogue:', error);
                        this.snackBar.open(
                            this.translate.instant('messages.' + error?.error?.message || 'catalogue-edit-failed'),
                            this.translate.instant('buttons.close'),
                            {
                                duration: 3000,
                            }
                        );
                    },
                });
            }
        });
    }
    deleteCatalogue(registrarCode: string, catalog: any): void {
        console.log('Delete catalogue:', catalog, 'for registrar:', registrarCode);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: catalog,
                    title: this.translate.instant('messages.confirm-delete-catalogue-title', { name: catalog.name }),
                    warning: this.translate.instant('buttons.confirm-delete'),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.registrarsService.deleteCatalogue(registrarCode, catalog.id).subscribe({
                        next: () => {
                            console.log('Catalogue deleted successfully');
                            this.loadRegistrarDetails(registrarCode);
                        },
                        error: (error) => {
                            console.error('Error deleting catalogue:', error);
                        },
                    });
                    this.snackBar.open(
                        this.translate.instant('messages.catalogue-deleted-successfully'),
                        this.translate.instant('buttons.close'),
                        {
                            duration: 3000,
                        }
                    );
                }
            });
    }
    showDetails(registrarCode: string, item: any, context: string): void {
        console.log('Show details for registrar:', registrarCode, 'and library or catalogue:', item);
        const dialogRef = this.dialog.open(DetailDialogComponent, {
            minWidth: '600px',
            data: {
                context: context,
                registrarCode: registrarCode,
                item: {
                    id: item.id,
                    name: item.name,
                    url: item.url,
                    urlPrefix: item.urlPrefix,
                    description: item.description,
                    created: item.created ? new Date(item.created.replace(/\[UTC\]$/, '')).toLocaleString() : '',
                    modified: item.modified ? new Date(item.modified.replace(/\[UTC\]$/, '')).toLocaleString() : '',
                },
            },
        });
    }
    openStatistics(registrarCode: string): void {
        console.log('Open statistics for registrar:', registrarCode);
    }
}
