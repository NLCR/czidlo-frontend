import { Component, signal, computed } from '@angular/core';
import { FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ImportRecordService } from '../../services/import-record.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistrarsService } from '../../services/registrars.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-import-record',
    standalone: false,
    templateUrl: './import-record.component.html',
    styleUrl: './import-record.component.scss',
})
export class ImportRecordComponent {
    loggedIn = computed(() => this.authService.loggedIn());
    assignedRegistars = [];
    selectedRegistrar: string = '';
    registrationMode: Array<{ value: string; label: string }> = [];
    selectedMode: string = '';

    intellectualEntities = new FormControl();
    intellectualEntitiesList = signal(<Array<string>>[]);
    selectedEntity: string = '';

    isSidebarOpen = signal(false);

    // FORM CONTROLS
    // BASIC DETAILS
    title = new FormControl<string>('', [Validators.required]);
    subTitle = new FormControl<string>('');
    monographTitle = new FormControl<string>('', [Validators.required]);
    periodicalTitle = new FormControl<string>('', [Validators.required]);
    volumeTitle = new FormControl<string>('', [Validators.required]);
    issueTitle = new FormControl<string>('', [Validators.required]);

    // IDENTIFIERS
    ccnb = new FormControl<string>('', [this.ccnbValidator()]);
    isbn = new FormControl<string>('', [this.isbnValidator()]);
    issn = new FormControl<string>('', [this.issnValidator()]);
    otherId = new FormControl<string>('');

    documentType = new FormControl<string>('', [Validators.required]);
    bornDigital: boolean = false;

    // ORIGINATORS
    selectedOriginatorType: string = 'author';
    primaryOriginatorTypes: Array<{ value: string; label: string }> = [];
    primaryOriginatorValue = new FormControl<string>('', [Validators.required]);
    otherOriginator = new FormControl<string>('');

    // PUBLICATION DETAILS
    place = new FormControl<string>('');
    publisher = new FormControl<string>('');
    year = new FormControl<string>('');

    // ARCHIVERS
    selectedArchiverId = '';
    archiverIds = new FormControl();
    archiverIdsList = signal<Array<any>>([]);

    urnNbn = new FormControl<string>('');
    financed = new FormControl<string>('');
    contractNumber = new FormControl<string>('');

    // TECHNICAL METADATA
    formatValue = new FormControl<string>('');
    formatVersion = new FormControl<string>('');
    extent = new FormControl<string>('');
    resolutionHorizontal = new FormControl<string>('');
    resolutionVertical = new FormControl<string>('');
    compressionRatio = new FormControl<string>('');
    compressionValue = new FormControl<string>('');
    colorModel = new FormControl<string>('');
    colorDepth = new FormControl<string>('');
    iccProfile = new FormControl<string>('');
    pictureSizeWidth = new FormControl<string>('');
    pictureSizeHeight = new FormControl<string>('');

    // THESIS
    degreeAwardingInstitution = new FormControl<string>('');

    // ANALYTICAL
    sourceDocumentTitle = new FormControl<string>('');
    sourceDocumentVolumeTitle = new FormControl<string>('');
    sourceDocumentIssueTitle = new FormControl<string>('');
    sourceDocumentCcnb = new FormControl<string>('');
    sourceDocumentIsbn = new FormControl<string>('');
    sourceDocumentIssn = new FormControl<string>('');
    sourceDocumentOtherId = new FormControl<string>('');
    sourceDocumentPlace = new FormControl<string>('');
    sourceDocumentPublisher = new FormControl<string>('');
    sourceDocumentYear = new FormControl<string>('');

    importRecordSnackBarVisible = signal(false);
    isButtonDisabled = signal(true);

    constructor(
        private importRecordService: ImportRecordService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private registrarsService: RegistrarsService,
        private authService: AuthService,
        private usersService: UsersService
    ) {}

    ngOnInit(): void {
        console.log('sidebar', this.isSidebarOpen());
        this.translate
            .get(['import.by-resolver', 'import.by-reservation', 'import.by-registrar', 'import.author', 'import.event', 'import.corporation'])
            // .subscribe((translations) => {
            //     this.registrationMode = [
            //         { value: 'resolver', label: translations['import.by-resolver'] },
            //         { value: 'reservation', label: translations['import.by-reservation'] },
            //         { value: 'registrar', label: translations['import.by-registrar'] },
            //     ];
            //     this.primaryOriginatorTypes = [
            //         { value: 'author', label: translations['import.author'] },
            //         { value: 'event', label: translations['import.event'] },
            //         { value: 'corporation', label: translations['import.corporation'] },
            //     ];
            //     this.selectedMode = this.registrationMode[0].value;
            // });

        this.registrarsService.getArchivers().subscribe({
            next: (data) => {
                this.archiverIdsList.set(this.registrarsService.archivers() || []);
                console.log('Archiver IDs for selection:', this.archiverIdsList());
            },
            error: (error) => {
                console.error('Error fetching archiver IDs:', error);
            },
        });
        this.usersService.getUserRights(this.authService.userInfo().id).subscribe({
            next: (data) => {
                this.assignedRegistars = data || [];
                console.log('Assigned registrars:', this.assignedRegistars);
                if (this.assignedRegistars.length > 0) {
                    this.selectedRegistrar = this.assignedRegistars[0];
                    this.registrarsService.getRegistrar(this.selectedRegistrar).subscribe({
                        next: (registrarData) => {
                            console.log('Selected registrar data:', registrarData);
                            if (registrarData.allowedRegistrationModeByRegistrar) {
                                this.registrationMode.push({ value: 'registrar', label: this.translate.instant('import.by-registrar') });
                            }
                            if (registrarData.allowedRegistrationModeByReservation) {
                                this.registrationMode.push({ value: 'reservation', label: this.translate.instant('import.by-reservation') });
                            }
                            if (registrarData.allowedRegistrationModeByResolver) {
                                this.registrationMode.push({ value: 'resolver', label: this.translate.instant('import.by-resolver') });
                            }
                            if (this.registrationMode.length > 0) {
                                this.selectedMode = this.registrationMode[0].value;
                            } else {
                                this.selectedMode = '';
                            }
                        },
                        error: (error) => {
                            console.error('Error fetching selected registrar data:', error);
                        },
                    });
                }
            },
            error: (error) => {
                console.error('Error fetching assigned registrars:', error);
            },
        });

        const controlsToWatch = [this.title, this.ccnb, this.isbn, this.issn];
        controlsToWatch.forEach((ctrl) => {
            ctrl.statusChanges.subscribe(() => {
                this.updateButtonState();
            });
            ctrl.valueChanges.subscribe(() => {
                this.updateButtonState();
            });
        });

        // inicializace při startu
        this.updateButtonState();

        this.intellectualEntitiesList.set(this.importRecordService.intellectualEntities() || []);
        this.selectedRegistrar = this.assignedRegistars[0];
        this.selectedEntity = this.intellectualEntitiesList()[0];

        console.log('selected', this.selectedMode, this.selectedEntity, this.selectedMode);
    }

    compareMode(a: string, b: string) {
        return a === b;
    }
    openSidebar() {
        this.isSidebarOpen.set(true);
    }
    closeSidebar() {
        this.isSidebarOpen.set(false);
    }
    buildRecordToImport() {
        let record: any = {};
        if (this.selectedEntity === 'MONOGRAPH') {
            if (this.title.valid) {
                record.title = this.title.value;
            } else {
                console.error('Title is required for MONOGRAPH');
                return null;
            }
        }
        console.log('record to import', record);
        return record;
    }
    importRecord() {
        const record = this.buildRecordToImport();
        if (!record) {
            console.error('Record is invalid, cannot import.');
            return;
        }
        this.importRecordSnackBarVisible.set(true);
        setTimeout(() => {
            this.importRecordSnackBarVisible.set(false);
        }, 3000);
    }
    onRegistrarChange() {
        console.log('Selected registrar changed to:', this.selectedRegistrar);
        this.registrationMode = [];
        this.registrarsService.getRegistrar(this.selectedRegistrar).subscribe({
            next: (registrarData) => {
                console.log('Selected registrar data:', registrarData);
                if (registrarData.allowedRegistrationModeByRegistrar) {
                    this.registrationMode.push({ value: 'registrar', label: this.translate.instant('import.by-registrar') });
                }
                if (registrarData.allowedRegistrationModeByReservation) {
                    this.registrationMode.push({ value: 'reservation', label: this.translate.instant('import.by-reservation') });
                }
                if (registrarData.allowedRegistrationModeByResolver) {
                    this.registrationMode.push({ value: 'resolver', label: this.translate.instant('import.by-resolver') });
                }
                if (this.registrationMode.length > 0) {
                    this.selectedMode = this.registrationMode[0].value;
                } else {
                    this.selectedMode = '';
                }
            },
            error: (error) => {
                console.error('Error fetching selected registrar data:', error);
            },
        });
    }

    // VALIDACNI FUNKCE
    updateButtonState() {
        // tlačítko se aktivuje jen když:
        // - title je validní (required)
        // - ccnb, isbn a issn jsou validní (nebo prázdné)
        const titleValid = this.title.valid;
        const ccnbValid = this.ccnb.valid;
        const isbnValid = this.isbn.valid;
        const issnValid = this.issn.valid;

        const isDisabled = !titleValid || !ccnbValid || !isbnValid || !issnValid;
        this.isButtonDisabled.set(isDisabled);
    }
    /** Validátor CCNB: musí začínat "cnb" a mít přesně 9 číslic */
    ccnbValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value?.trim();
            if (!value) return null; // prázdné pole je OK, pokud není required
            const regex = /^cnb\d{9}$/i;
            return regex.test(value) ? null : { invalidCcnb: true };
        };
    }

    /** Validátor ISSN: formát 1234-567X (X může být číslice nebo X) */
    issnValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value?.trim();
            if (!value) return null;
            const regex = /^\d{4}-\d{3}[\dXx]$/;
            return regex.test(value) ? null : { invalidIssn: true };
        };
    }

    /** Validátor ISBN: povolíme 10 nebo 13 číslic, případně s pomlčkami */
    isbnValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value?.trim();
            if (!value) return null;
            const regex = /^(97(8|9))?\d{9}(\d|X)$/; // ISBN-10 nebo ISBN-13
            return regex.test(value.replace(/[-\s]/g, '')) ? null : { invalidIsbn: true };
        };
    }
}
