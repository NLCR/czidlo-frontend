import { Component, signal, inject, Signal } from '@angular/core';
import { ProcessesService } from '../../services/processes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { switchMap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-processes',
    standalone: false,
    templateUrl: './processes.component.html',
    styleUrl: './processes.component.scss',
})
export class ProcessesComponent {
    processes = signal<Array<any>>([]);
    definitions = signal<Array<any>>([
        { type: 'OAI_ADAPTER' },
        { type: 'REGISTRARS_URN_NBN_CSV_EXPORT' },
        { type: 'DI_URL_AVAILABILITY_CHECK' },
        { type: 'INDEXATION' },
    ]);
    isActive = 'instances';
    loadingProcesses = signal(false);
    isSidebarOpen = signal(false);
    activeProcess: any = null;
    activeDefinition: string | null = null;
    activeAction: string | null = null;

    startDateControl = new FormControl();
    endDateControl = new FormControl();

    private _snackBar = inject(MatSnackBar);
    // private _dialog = inject(MatDialog);

    showMyProcesses = false;

    registators = new FormControl();
    registatorList = signal(<Array<string>>[]);
    intellectualEntities = new FormControl();
    intellectualEntitiesList = signal(<Array<string>>[]);
    identifiers = new FormControl();
    identifiersList = signal(<Array<string>>[]);
    selectedUrnNbnState = 'ALL';
    selectedDIState = 'ALL';
    selectedState = 'ALL';
    states = ['ALL', 'ACTIVE', 'DEACTIVATED'];
    selectedIncludeCount = true;
    includeCounts = [true, false];

    constructor(
        private processesService: ProcessesService,
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        const today = new Date();
        const startDate = new Date(2012, 8, 1); // Měsíc je 0-indexovaný, takže 8 = září
        this.startDateControl.setValue(startDate);
        this.endDateControl.setValue(today);

        this.registatorList.set(this.processesService.registrators() || []);
        this.intellectualEntitiesList.set(this.processesService.intellectualEntities() || []);
        this.identifiersList.set(this.processesService.identifiers() || []);

        this.route.url.subscribe((url) => {
            this.isActive = url[1]?.path || 'instances';
            // REDIRECT TO INSTANCES IF NO SUBPATH
            if (url.length < 2) {
                this.router.navigate(['/processes', 'instances']);
            }
            // INSTANCES
            if (this.isActive === 'instances') {
                this.loadingProcesses.set(true);
                if (this.processesService.processes().length === 0) {
                    console.log('Loading processes...');
                    this.loadProcesses();
                } else {
                    this.processes.set(this.processesService.processes());
                    this.loadingProcesses.set(false);
                }
                if (url.length === 3) {
                    const processId = url[2]?.path;
                    this.loadProcessDetails(processId);
                }
            }
            // DEFINITIONS
            if (this.isActive === 'definitions') {
                if (url.length > 3) {
                    const definition = url[2]?.path;
                    const action = url[3]?.path;
                    if (this.definitions().find((def) => def.type === definition)) {
                        this.activeDefinition = definition;
                        this.activeAction = action;
                        this.isSidebarOpen.set(true);
                    } else {
                        console.warn('Definition not found:', definition);
                        this.isSidebarOpen.set(false);
                    }
                }
            }
        });
    }

    loadProcesses() {
        this.processesService.getProcesses().subscribe({
            next: () => {
                this.processes.set(this.processesService.processes());
            },
            error: (error) => {
                console.error('Error loading processes:', error);
                this.loadingProcesses.set(false);
            },
            complete: () => {
                console.log('Processes loading complete');
                this.loadingProcesses.set(false);
            },
        });
    }

    loadProcessDetails(id: string) {
        this.processesService
            .getProcess(id)
            .pipe(
                switchMap((data) =>
                    this.processesService.getLog(id).pipe(
                        map((logData) => ({ ...data, log: logData })),
                        catchError((error) => of({ ...data, log: error || 'Error loading log' }))
                    )
                )
            )
            .subscribe({
                next: (combinedData) => {
                    console.log('Process + log loaded:', combinedData);
                    this.activeProcess = combinedData;
                    this.isSidebarOpen.set(true);
                },
                error: (error) => {
                    console.error('Error loading process details:', error);
                },
            });
    }

    downloadProcessOutput(id: string) {
        this.processesService.getOutput(id).subscribe({
            next: (response) => {
                // Název souboru z hlavičky
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'download';

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    if (match) filename = match[1];
                }

                // Blob a odkaz pro stažení
                const blob = new Blob([response.body!], { type: response.body!.type || 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                console.log(`File downloaded: ${filename}`);
            },
            error: (err) => {
                console.error('Error downloading file:', err);
            },
        });
    }

    openSidebar(process: any) {
        if (this.isActive === 'instances') {
            this.router.navigate(['/processes', 'instances', process.id]);
            this.isSidebarOpen.set(true);
        }
    }

    closeSidebar() {
        this.router.navigate(['/processes', this.isActive]);
        this.isSidebarOpen.set(false);
    }

    downloadProcess(process: any) {
        console.log('Downloading process:', process);
        const jsonStr = JSON.stringify(process, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // otevře v novém okně
        window.open(url, '_blank');
    }

    copyProcess(process: any) {
        console.log('Copying process:', process);
        const jsonStr = JSON.stringify(process, null, 2);
        navigator.clipboard
            .writeText(jsonStr)
            .then(() => {
                console.log('JSON byl zkopírován do schránky.');
            })
            .catch((err) => {
                console.error('Chyba při kopírování JSONu:', err);
            });
        this.openSnackBar(this.translate.instant('messages.copied-to-clipboard'), 'OK');
    }

    deleteProcess(process: any) {
        console.log('Deleting process:', process);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: process,
                    title: this.translate.instant('messages.confirm-delete-title'),
                    confirm: this.translate.instant('buttons.confirm-delete'),
                    // message: this.translate.instant('messages.confirm-delete-message', { name: process.name }),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.processesService.deleteProcess(process.id).subscribe({
                        next: () => {
                            console.log('Process deleted successfully');
                            this.loadProcesses();
                        },
                        error: (error) => {
                            console.error('Error deleting process:', error);
                        },
                    });
                }
            });
    }
    killProcess(process: any) {
        console.log('Killing process:', process);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: process,
                    title: this.translate.instant('messages.confirm-kill-title'),
                    confirm: this.translate.instant('buttons.confirm-kill'),
                    // message: this.translate.instant('messages.confirm-delete-message', { name: process.name }),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.processesService.killProcess(process.id).subscribe({
                        next: () => {
                            console.log('Process killed successfully');
                            this.loadProcesses();
                        },
                        error: (error) => {
                            console.error('Error killing process:', error);
                        },
                    });
                }
            });
    }
    cancelProcess(process: any) {
        console.log('Canceling process:', process);
        this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    data: process,
                    title: this.translate.instant('messages.confirm-cancel-title'),
                    confirm: this.translate.instant('buttons.confirm-cancel'),
                    // message: this.translate.instant('messages.confirm-delete-message', { name: process.name }),
                },
                maxWidth: '800px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.processesService.cancelProcess(process.id).subscribe({
                        next: () => {
                            console.log('Process canceled successfully');
                            this.loadProcesses();
                        },
                        error: (error) => {
                            console.error('Error canceling process:', error);
                        },
                    });
                }
            });
    }

    toggleShowMyProcesses() {
        this.showMyProcesses = !this.showMyProcesses;
        if (this.showMyProcesses) {
            // TODO
            const currentUserLogin = 'pavla'; // TODO: Nahradit skutečným přihlašovacím jménem
            this.processesService.getProcessesByOwner(currentUserLogin).subscribe({
                next: () => {
                    this.processes.set(this.processesService.processes());
                },
                error: (error) => {
                    console.error('Error loading user processes:', error);
                },
            });
        } else {
            // Načíst všechny procesy
            this.loadProcesses();
        }
    }

    openSnackBar(message: string, action: string) {
        console.log('Opening snackbar with message:', message);
        this._snackBar.open(message, action, { duration: 1500 });
    }

    openProcess(action: string, definition: string) {
        console.log('Opening process:', definition);
        this.router.navigate(['/processes', 'definitions', definition, action]);
    }

    planProcess(activeProcess: any) {
        console.log('Planning process:', activeProcess);
        if (activeProcess === 'OAI_ADAPTER') {
            console.log('Planning OAI_ADAPTER process...');
        }
        if (activeProcess === 'REGISTRARS_URN_NBN_CSV_EXPORT') {
            console.log('Planning REGISTRARS_URN_NBN_CSV_EXPORT process...');
            const startDate = this.startDateControl.value;
            const endDate = this.endDateControl.value;
            console.log('With start date:', startDate);
            console.log('With end date:', endDate);
            const registrators = this.registators.value;
            console.log('With registrators:', registrators);
            const intellectualEntities = this.intellectualEntities.value;
            console.log('With intellectual entities:', intellectualEntities);
            const identifiers = this.identifiers.value;
            console.log('With identifiers:', identifiers);
            console.log('With state:', this.selectedState);
            console.log('With includeCount:', this.selectedIncludeCount);
        }
        if (activeProcess === 'DI_URL_AVAILABILITY_CHECK') {
            console.log('Planning DI_URL_AVAILABILITY_CHECK process...');
            const registrators = this.registators.value;
            console.log('With registrators:', registrators);
            const intellectualEntities = this.intellectualEntities.value;
            console.log('With intellectual entities:', intellectualEntities);
            console.log('With UrnNbnState:', this.selectedUrnNbnState);
            const startDate = this.startDateControl.value;
            const endDate = this.endDateControl.value;
            console.log('With start date:', startDate);
            console.log('With end date:', endDate);
            console.log('With DIState:', this.selectedDIState);
        }
        if (activeProcess === 'INDEXATION') {
            console.log('Planning INDEXATION process...');
            const startDate = this.startDateControl.value;
            const endDate = this.endDateControl.value;
            console.log('With start date:', startDate);
            console.log('With end date:', endDate);
        }
    }

    setProcess(activeProcess: any) {
        console.log('Setting process:', activeProcess);
    }
}
