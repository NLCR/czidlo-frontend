import { Component, signal, inject, computed, Inject, effect } from '@angular/core';
import { ProcessesService } from '../../services/processes.service';
import { RegistrarsService } from '../../services/registrars.service';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AddXslStylesheetComponent } from '../../dialogs/add-xsl-stylesheet/add-xsl-stylesheet.component';
import { TransformationDetailDialogComponent } from '../../dialogs/transformation-detail-dialog/transformation-detail-dialog.component';

@Component({
    selector: 'app-processes',
    standalone: false,
    templateUrl: './processes.component.html',
    styleUrl: './processes.component.scss',
})
export class ProcessesComponent {
    loggedIn = computed(() => this.authService.loggedIn());

    processes = signal<Array<any>>([]);
    definitions = signal<Array<any>>([
        { type: 'OAI_ADAPTER' },
        { type: 'REGISTRARS_URN_NBN_CSV_EXPORT' },
        { type: 'DI_URL_AVAILABILITY_CHECK' },
        { type: 'INDEXATION' },
    ]);
    isActive = 'instances';
    processPlannedSnackBarVisible = signal(false);
    loadingProcesses = signal(false);
    isSidebarOpen = signal(false);
    activeProcess: any = null;
    activeDefinition = signal<string | null>(null);
    activeAction: string | null = null;

    // TRANSFORMATIONS
    rddTransformations = signal<Array<any>>([]);
    activeRddTransformation: any = null;
    selectedRddTransformationId: string = '';
    idsTransformations = signal<Array<any>>([]);
    activeIdsTransformation: any = null;
    selectedIdsTransformationId: string = '';
    transformWithUrnNbn = true;
    transformWithoutUrnNbn = false;
    mergeDigitalInstances = true;
    ignoreDiffInAccess = true;
    ignoreDiffInFormat = true;

    startDateControl = new FormControl<Date | null>(null, [Validators.required, this.dateValidator]);
    endDateControl = new FormControl<Date | null>(null, [Validators.required, this.dateValidator]);

    deactivationStartControl = new FormControl<Date | null>(null, [this.dateValidator]);
    deactivationEndControl = new FormControl<Date | null>(null, [this.dateValidator]);

    // 🟢 Signály, které sledují změny formulářů
    startDateValue = signal<Date | null>(null);
    endDateValue = signal<Date | null>(null);
    deactivationStartValue = signal<Date | null>(null);
    deactivationEndValue = signal<Date | null>(null);

    private _snackBar = inject(MatSnackBar);
    // private _dialog = inject(MatDialog);

    showMyProcesses = false;

    registrars = new FormControl();
    registrarList = signal(<Array<any>>[]);
    assignedRegistrars = signal(<Array<any>>[]);
    loadingRegistrars = signal(false);
    selectedRegistrar: any = null;

    intellectualEntities = new FormControl();
    intellectualEntitiesList = signal(<Array<string>>[]);
    missingCNB = false;
    missingISSN = false;
    missingISBN = false;
    selectedUrnNbnState = 'ALL';
    selectedDIState = 'ALL';
    selectedState = 'ALL';
    states = ['ALL', 'ACTIVE', 'DEACTIVATED'];
    selectedIncludeCount = false;

    oaiBaseUrlControl = new FormControl('', [Validators.required]);
    oaiMetadataPrefixControl = new FormControl('', [Validators.required]);
    oaiSetControl = new FormControl('', [Validators.required]);
    selectedRegistrarForOaiImportId = '';

    isPlanButtonDisabled = computed(() => {
        const def = this.activeDefinition();
        const start = this.startDateValue();
        const end = this.endDateValue();

        const startInvalid = this.startDateControl.invalid || !start;
        const endInvalid = this.endDateControl.invalid || !end;

        if (def === 'OAI_ADAPTER') return false;
        if (def === 'REGISTRARS_URN_NBN_CSV_EXPORT' || def === 'DI_URL_AVAILABILITY_CHECK') {
            return startInvalid || endInvalid;
        }
        if (def === 'INDEXATION') {
            return !start || !end;
        }
        return true;
    });

    constructor(
        private processesService: ProcessesService,
        private registrarsService: RegistrarsService,
        private usersService: UsersService,
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private dialog: MatDialog,
        private authService: AuthService,
        private dateAdapter: DateAdapter<Date>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: any,
    ) {
        // 🧩 Propojení valueChanges → signal
        this.startDateControl.valueChanges.subscribe((value) => this.startDateValue.set(value));
        this.endDateControl.valueChanges.subscribe((value) => this.endDateValue.set(value));
        this.deactivationStartControl.valueChanges.subscribe((value) => this.deactivationStartValue.set(value));
        this.deactivationEndControl.valueChanges.subscribe((value) => this.deactivationEndValue.set(value));

        effect(() => {
            const isLoggedIn = this.loggedIn();

            if (isLoggedIn) {
                this.loadAssignedRegistrars();
            } else {
                this.resetRegistrars();
            }
        });
    }

    ngOnInit() {
        const today = new Date();
        const startDate = new Date(2012, 8, 1); // Měsíc je 0-indexovaný, takže 8 = září
        this.startDateControl.setValue(startDate);
        this.endDateControl.setValue(today);
        this.deactivationStartControl.setValue(startDate);
        this.deactivationEndControl.setValue(today);
        this.deactivationStartControl.disable();
        this.deactivationEndControl.disable();

        this.intellectualEntitiesList.set(this.processesService.intellectualEntities() || []);
        this.loadRegistrarCodes();

        this.route.url.subscribe((url) => {
            this.isActive = url[1]?.path || 'instances';
            // REDIRECT TO INSTANCES IF NO SUBPATH
            if (url.length < 2) {
                this.router.navigate(['/processes', 'instances']);
            }
            // INSTANCES
            if (this.isActive === 'instances') {
                if (this.processesService.processes().length === 0) {
                    console.log('Loading processes from server...');
                    this.loadProcesses();
                } else {
                    this.processes.set(this.processesService.processes());
                    console.log('Processes loaded from service:', this.processes());
                }
                if (url.length === 3) {
                    console.log('Loading process details...', this.processes());
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
                        this.activeDefinition.set(definition);
                        this.activeAction = action;
                        this.isSidebarOpen.set(true);
                    } else {
                        console.warn('Definition not found:', definition);
                        this.isSidebarOpen.set(false);
                    }
                }
            }
        });
        // ======== TODO API FETCH =======
        // RDD TRANSFORMATIONS
        this.rddTransformations.set([
            { name: 'Transformation 1', id: 'rdd_transf_1', description: 'Description of Transformation 1', created: '2023-10-01 10:00:00' },
            { name: 'Transformation 2', id: 'rdd_transf_2', description: '', created: '2023-11-15 14:30:00' },
        ]);
        // IDS TRANSFORMATIONS
        this.idsTransformations.set([
            { name: 'IDS Transformation A', id: 'ids_transf_a', description: 'Description of IDS Transformation A', created: '2024-01-20 09:15:00' },
            { name: 'IDS Transformation B', id: 'ids_transf_b', description: '', created: '2024-02-10 16:45:00' },
        ]);
        this.selectedRddTransformationId = this.rddTransformations()[0]?.id || '';
        this.selectedIdsTransformationId = this.idsTransformations()[0]?.id || '';
    }

    loadRegistrarCodes() {
        this.registrarsService.getRegistrars().subscribe({
            next: (response) => {
                this.registrarList.set(
                    response.items.map((r: any) => ({
                        code: r.code,
                        name: r.name,
                    })),
                );
            },
        });
    }
    loadAssignedRegistrars() {
        this.loadingRegistrars.set(true);
        const userId = this.authService.getUserId();
        if (!userId) {
            console.error('User ID is null despite being logged in.');
            this.loadingRegistrars.set(false);
            return;
        }

        this.usersService.getUserRights(userId).subscribe({
            next: (data) => {
                this.assignedRegistrars.set(data || []);
                console.log('Assigned registrars:', this.assignedRegistrars());

                if (this.assignedRegistrars().length > 0) {
                    if (this.assignedRegistrars().includes('nk')) {
                        this.selectedRegistrar = 'nk';
                    } else {
                        this.selectedRegistrar = this.assignedRegistrars()[0];
                    }
                }
                this.loadingRegistrars.set(false);
            },
            error: (error) => {
                console.error('Error fetching assigned registrars:', error);
                this.loadingRegistrars.set(false);
            },
        });
    }
    resetRegistrars() {
        this.assignedRegistrars.set([]);
    }

    loadProcesses() {
        this.loadingProcesses.set(true);
        this.processesService.getProcesses().subscribe({
            next: () => {
                // console.log('Processes loaded:', this.processesService.processes());
                this.processes.set(this.processesService.processes());
            },
            error: (error) => {
                console.error('Error loading processes:', error);
                this.loadingProcesses.set(false);
            },
            complete: () => {
                // console.log('Processes loading complete');
                this.loadingProcesses.set(false);
            },
        });
    }

    loadProcessDetails(id: string) {
        this.processesService
            .getProcess(id)
            .pipe(
                tap((data) => {
                    console.log('Process data received for', id, ':', data);
                    data.id = data.id;
                    data.type = data.type;
                    data.ownerLogin = data.ownerLogin;
                    data.state = data.state;
                    data.duration = data.finished
                        ? (() => {
                              const start = new Date(data.started.replace(/\[UTC\]$/, '')).getTime();
                              const end = new Date(data.finished.replace(/\[UTC\]$/, '')).getTime();
                              const diffSec = Math.round((end - start) / 1000);
                              return diffSec;
                          })()
                        : '---';
                    data.scheduled = data.scheduled ? new Date(data.scheduled?.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                    data.started = data.started ? new Date(data.started?.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                    data.finished = data.finished ? new Date(data.finished?.replace(/\[UTC\]$/, '')).toLocaleString() : '---';
                }),
                switchMap((data) =>
                    this.processesService.getLog(id).pipe(
                        map((logData) => ({ ...data, log: logData })),
                        catchError((error) => of({ ...data, logError: error || 'Error loading log' })),
                    ),
                ),
            )
            .subscribe({
                next: (combinedData) => {
                    console.log('Process + log loaded:', combinedData);
                    this.activeProcess = combinedData;
                    // console.log('Current processes:', this.processes());
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
                console.log(contentDisposition);
                let filename = '';

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    if (match) filename = 'process_' + id + '_' + match[1];
                }

                const blob = new Blob([response.body!], { type: response.body!.type || 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                console.log(`File downloaded: ${filename}`);
            },
            error: (err) => {
                console.error('Error downloading file:', err);
                this._snackBar.open(this.translate.instant('messages.error-downloading-file') + ': ' + err.error.message, 'OK');
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

    downloadLog(process: any) {
        console.log('Downloading process log:', process);
        const logText = process.log ?? process.logError ?? 'No log available';
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Jméno souboru – např. process_430_log.txt
        const filename = `process_${process.id || 'id'}_log.txt`;

        // Vytvoření <a> elementu
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;

        // Klik pro stažení
        a.click();

        // Uvolnění URL
        URL.revokeObjectURL(url);
    }

    copyLog(process: any) {
        console.log('Copying process log:', process);
        const jsonStr = JSON.stringify(process.log, null, 2);
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
                    title: 'messages.confirm-delete-process-title',
                    warning: 'buttons.confirm-delete',
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
                    title: 'messages.confirm-kill-process-title',
                    warning: 'buttons.confirm-kill',
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
                    title: 'messages.confirm-cancel-process-title',
                    warning: 'buttons.confirm-cancel',
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
            this.processPlannedSnackBarVisible.set(true);
        }
        // PLAN REGISTRARS URN NBN CSV EXPORT
        if (activeProcess === 'REGISTRARS_URN_NBN_CSV_EXPORT') {
            console.log('Planning REGISTRARS_URN_NBN_CSV_EXPORT process...');
            const registrationStart = this.startDateControl.value;
            const registrationEnd = this.endDateControl.value;
            const registrarCodes = this.registrars.value?.join(',');
            const entityTypes = this.intellectualEntities.value?.join(',');
            const withMissingCnbOnly = this.missingCNB;
            const withMissingIssnOnly = this.missingISSN;
            const withMissingIsbnOnly = this.missingISBN;
            const returnActive = this.selectedState === 'ALL' || this.selectedState === 'ACTIVE';
            const returnDeactivated = this.selectedState === 'ALL' || this.selectedState === 'DEACTIVATED';
            let enabledDeactivationDates = this.selectedState === 'DEACTIVATED';
            const deactivationStart = enabledDeactivationDates ? this.deactivationStartControl.value?.toISOString().split('T')[0] || null : null;
            const deactivationEnd = enabledDeactivationDates ? this.deactivationEndControl.value?.toISOString().split('T')[0] || null : null;
            const exportNumOfDigInstances = this.selectedIncludeCount || false;

            let body = {
                type: 'REGISTRARS_URN_NBN_CSV_EXPORT',
                params: {
                    registrationDateFrom: registrationStart?.toISOString().split('T')[0], // jen datum YYYY-MM-DD
                    registrationDateTo: registrationEnd?.toISOString().split('T')[0], // jen datum YYYY-MM-DD
                    registrarCodes: registrarCodes,
                    intEntTypes: entityTypes,
                    withMissingCnbOnly: withMissingCnbOnly,
                    withMissingIssnOnly: withMissingIssnOnly,
                    withMissingIsbnOnly: withMissingIsbnOnly,
                    returnActive: returnActive,
                    returnDeactivated: returnDeactivated,
                    deactivationDateFrom: deactivationStart,
                    deactivationDateTo: deactivationEnd,
                    exportNumOfDigInstances: exportNumOfDigInstances,
                },
            };
            console.log('REGISTRARS_URN_NBN_CSV_EXPORT', body);
            this.processesService.planProcess(body).subscribe({
                next: (data) => {
                    console.log('Registrars URN NBN CSV Export process planned successfully:', data);
                    this.openSnackBar(this.translate.instant('messages.process-planned-successfully'), 'OK');
                    this.closeSidebar();
                    this.loadProcesses();
                },
                error: (error) => {
                    console.error('Error planning Registrars URN NBN CSV Export process:', error);
                    this.openSnackBar(this.translate.instant('messages.error-planning-process'), 'OK');
                },
            });
        }
        // PLAN URL AVAILABILITY CHECK
        if (activeProcess === 'DI_URL_AVAILABILITY_CHECK') {
            console.log('Planning DI_URL_AVAILABILITY_CHECK process...');
            const registrarCodes = this.registrars.value?.join(',') || '';
            const intEntTypes = this.intellectualEntities.value?.join(',') || '';
            const urnNbnStatesIncludeActive: boolean = this.selectedUrnNbnState === 'ALL' || this.selectedUrnNbnState === 'ACTIVE';
            const urnNbnStatesIncludeDeactivated: boolean = this.selectedUrnNbnState === 'ALL' || this.selectedUrnNbnState === 'DEACTIVATED';
            const diStatesIncludeActive: boolean = this.selectedDIState === 'ALL' || this.selectedDIState === 'ACTIVE';
            const diStatesIncludeDeactivated: boolean = this.selectedDIState === 'ALL' || this.selectedDIState === 'DEACTIVATED';
            const diDsFrom = this.startDateControl.value?.toISOString();
            const diDsTo = this.endDateControl.value?.toISOString();

            let body = {
                type: 'DI_URL_AVAILABILITY_CHECK',
                params: {
                    registrarCodes: registrarCodes,
                    intEntTypes: intEntTypes,
                    urnNbnStatesIncludeActive: urnNbnStatesIncludeActive,
                    urnNbnStatesIncludeDeactivated: urnNbnStatesIncludeDeactivated,
                    diStatesIncludeActive: diStatesIncludeActive,
                    diStatesIncludeDeactivated: diStatesIncludeDeactivated,
                    diDsFrom: diDsFrom,
                    diDsTo: diDsTo,
                },
            };

            this.processesService.planProcess(body).subscribe({
                next: (data) => {
                    console.log('DI URL Availability Check process planned successfully:', data);
                    this.openSnackBar(this.translate.instant('messages.process-planned-successfully'), 'OK');
                    this.closeSidebar();
                    this.loadProcesses();
                },
                error: (error) => {
                    console.error('Error planning DI URL Availability Check process:', error);
                    this.openSnackBar(this.translate.instant('messages.error-planning-process'), 'OK');
                },
            });
        }
        // PLAN INDEXATION
        if (activeProcess === 'INDEXATION') {
            console.log('Planning INDEXATION process...');
            const startDate = this.startDateControl.value;
            const endDate = this.endDateControl.value;
            let body = {};
            if (startDate && endDate) {
                body = {
                    type: 'INDEXATION',
                    params: {
                        mod_date_from: startDate?.toISOString().split('T')[0], // jen datum YYYY-MM-DD
                        mod_date_to: endDate?.toISOString().split('T')[0], // jen datum YYYY-MM-DD
                    },
                };
            }
            this.processesService.planProcess(body).subscribe({
                next: (data) => {
                    console.log('Indexation process planned successfully:', data);
                    this.openSnackBar(this.translate.instant('messages.process-planned-successfully'), 'OK');
                    this.closeSidebar();
                    this.loadProcesses();
                },
                error: (error) => {
                    console.error('Error planning indexation process:', error);
                    this.openSnackBar(this.translate.instant('messages.error-planning-process'), 'OK');
                },
            });
        }
    }

    setProcess(activeProcess: any) {
        console.log('Setting process:', activeProcess);
    }

    displayLogError(process: any) {
        if (process) {
            console.log('Displaying log error for process:', process);
            if (process.state === 'SCHEDULED') {
                return this.translate.instant('processes.log-scheduled');
            } else {
                return 'stav: ' + process.state;
            }
        }
    }

    dateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            // 1) Material už dal parse error (uživatel píše nesmysl) → neplatné
            //    Např. { text: 'abc' } nebo podobná struktura dle adapteru
            const matParseErr = (control as any).getError?.('matDatepickerParse');
            if (matParseErr) return { invalidDate: true };

            // 2) prázdná hodnota necháme na Validators.required
            if (value === null || value === '') return null;

            // 3) validní je jen skutečný Date s platným časem
            if (value instanceof Date) {
                return isNaN(value.getTime()) ? { invalidDate: true } : null;
            }

            // 4) pokud je to string → zkusíme převést adapterem podle formátu,
            //    a když to není validní Date, označíme za chybu
            if (typeof value === 'string') {
                const parsed = this.dateAdapter.parse(value, this.dateFormats?.parse?.dateInput);
                if (parsed instanceof Date && !isNaN(parsed.getTime())) {
                    return null;
                }
                return { invalidDate: true };
            }

            // 5) cokoliv jiného (např. objekt) je neplatné
            return { invalidDate: true };
        };
    }
    removeSelectedRegistrar(item: string) {
        const currentItems = this.registrars.value || [];
        const index = currentItems.indexOf(item);
        if (index >= 0) {
            currentItems.splice(index, 1);
            this.registrars.setValue(currentItems);
        }
    }
    removeSelectedEntity(item: string) {
        const currentItems = this.intellectualEntities.value || [];
        const index = currentItems.indexOf(item);
        if (index >= 0) {
            currentItems.splice(index, 1);
            this.intellectualEntities.setValue(currentItems);
        }
    }

    onStateChange(state: string) {
        this.selectedState = state as any;

        if (this.selectedState === 'DEACTIVATED') {
            this.deactivationStartControl.enable();
            this.deactivationEndControl.enable();
        } else {
            this.deactivationStartControl.disable();
            this.deactivationEndControl.disable();
            // volitelně: vymaž hodnoty
            // this.deactivationStartControl.reset();
            // this.deactivationEndControl.reset();
        }
    }
    toggleIncludeCount() {
        this.selectedIncludeCount = !this.selectedIncludeCount;
    }

    formatDuration(seconds: number): string {
        if (seconds < 60) {
            return `${seconds} s`;
        }

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h} h ${m} min ${s} s`;
        } else {
            return `${m} min ${s} s`;
        }
    }
    openAddXslStylesheetDialog(context: string) {
        const dialogRef = this.dialog.open(AddXslStylesheetComponent, {
            width: '800px',
            maxWidth: '800px',
            data: {
                // předání dat do dialogu, pokud je potřeba
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Dialog result:', result);
                // Zpracování výsledku z dialogu
                if (context === 'rdd') {
                    this.rddTransformations.set([...this.rddTransformations(), result]);
                }
                if (context === 'ids') {
                    this.idsTransformations.set([...this.idsTransformations(), result]);
                }
            } else {
                console.log('Dialog was closed without action');
            }
        });
    }
    downloadTransformation(transformation: any) {
        console.log('Downloading transformation:', transformation);
        // Implement the download logic here
    }
    openRddTransformation(transformation: any) {
        console.log('Opening RDD transformation:', transformation);
        this.activeRddTransformation = transformation;
        const dialogRef = this.dialog.open(TransformationDetailDialogComponent, {
            data: {
                data: transformation,
                title: transformation.name,
                confirmButtonText: this.translate.instant('buttons.close'),
            },
            maxWidth: '800px',
        });

        dialogRef.afterClosed().subscribe(() => {
            this.activeRddTransformation = null;
        });
    }
    removeTransformation(context: string, transformation: any) {
        console.log('Removing transformation:', transformation);
        // Implement the removal logic here
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                data: transformation,
                title: this.translate.instant('messages.confirm-delete-transformation-title'),
                message: this.translate.instant('messages.confirm-delete-transformation-message', { name: transformation.name }),
                warning: 'buttons.confirm-delete',
            },
            maxWidth: '800px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (context === 'rdd') {
                    this.rddTransformations.set(this.rddTransformations().filter((t) => t.id !== transformation.id));
                }
                if (context === 'ids') {
                    this.idsTransformations.set(this.idsTransformations().filter((t) => t.id !== transformation.id));
                }
            }
        });
    }
}
