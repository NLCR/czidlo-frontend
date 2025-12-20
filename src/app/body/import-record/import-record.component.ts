import { Component, signal, computed, effect } from '@angular/core';
import { FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ImportRecordService } from '../../services/import-record.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistrarsService } from '../../services/registrars.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-import-record',
    standalone: false,
    templateUrl: './import-record.component.html',
    styleUrl: './import-record.component.scss',
})
export class ImportRecordComponent {
    loadingRegistrars = signal(false);
    loggedIn = computed(() => this.authService.loggedIn());
    assignedRegistrars = [];
    selectedRegistrar: string = '';
    registrationMode: Array<{ value: string; label: string }> = [];
    selectedMode: string = '';

    intellectualEntities = new FormControl();
    intellectualEntitiesList = signal(<Array<string>>[]);
    selectedEntity: string = '';

    isSidebarOpen = signal(false);
    progressBar = signal({ state: false, value: '', error: '', urnnbn: '' });

    // FORM CONTROLS
    // BASIC DETAILS
    title = new FormControl<string>('', [Validators.required]);
    subTitle = new FormControl<string>('');
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
    selectedOriginatorType: string = 'AUTHOR';
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
    formatValue = new FormControl<string>('image/jp2', [Validators.required]);
    formatVersion = new FormControl<string>('verze 1.0', [Validators.required]);
    extent = new FormControl<string>('');
    resolutionHorizontal = new FormControl<number>(0, [this.positiveNumberValidator(), Validators.required]);
    resolutionVertical = new FormControl<number>(0, [this.positiveNumberValidator(), Validators.required]);
    compression = new FormControl<string>('JPEG2000', Validators.required);
    // compressionRatio = new FormControl<string>('');
    // compressionValue = new FormControl<string>('');
    colorModel = new FormControl<string>('');
    colorDepth = new FormControl<string>('');
    iccProfile = new FormControl<string>('');
    pictureSizeWidth = new FormControl<number>(0, [this.positiveNumberValidator(), Validators.required]);
    pictureSizeHeight = new FormControl<number>(0, [this.positiveNumberValidator(), Validators.required]);

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

    isButtonDisabled = signal(true);

    constructor(
        private importRecordService: ImportRecordService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private registrarsService: RegistrarsService,
        private authService: AuthService,
        private usersService: UsersService,
        private apiService: ApiService
    ) {
        effect(() => {
            const isLoggedIn = this.loggedIn();

            if (isLoggedIn) {
                this.loadRegistrarsAfterLogin();
            } else {
                this.resetRegistrars();
            }
        });
    }

    ngOnInit(): void {
        this.translate
            .get(['import.by-resolver', 'import.by-reservation', 'import.by-registrar', 'import.author', 'import.event', 'import.corporation'])
            .subscribe((translations) => {
                this.primaryOriginatorTypes = [
                    { value: 'AUTHOR', label: translations['import.author'] },
                    { value: 'EVENT', label: translations['import.event'] },
                    { value: 'CORPORATION', label: translations['import.corporation'] },
                ];
            });

        const controlsToWatch: FormControl[] = [
            this.title,
            this.ccnb,
            this.isbn,
            this.issn,
            this.formatValue,
            this.formatVersion,
            this.resolutionHorizontal,
            this.resolutionVertical,
            this.pictureSizeWidth,
            this.pictureSizeHeight
        ];
        controlsToWatch.forEach((ctrl) => {
            ctrl.statusChanges.subscribe(() => {
                this.importButtonState();
            });
            ctrl.valueChanges.subscribe(() => {
                this.importButtonState();
            });
        });

        // inicializace při startu
        this.importButtonState();

        this.intellectualEntitiesList.set(this.importRecordService.intellectualEntities() || []);
        this.selectedRegistrar = this.assignedRegistrars[0];
        this.selectedEntity = this.intellectualEntitiesList()[0];

        console.log('selected', this.selectedMode, this.selectedEntity, this.selectedMode);
    }

    private loadRegistrarsAfterLogin() {
        this.loadingRegistrars.set(true);
        const userId = this.authService.getUserId();
        if (!userId) {
            console.error('User ID is null despite being logged in.');
            this.loadingRegistrars.set(false);
            return;
        }

        this.registrarsService.getArchivers().subscribe({
            next: (data) => {
                this.archiverIdsList.set(this.registrarsService.archivers() || []);
            },
            error: (error) => {
                console.error('Error fetching archiver IDs:', error);
            },
        });

        this.usersService.getUserRights(userId).subscribe({
            next: (data) => {
                this.assignedRegistrars = data || [];
                console.log('Assigned registrars:', this.assignedRegistrars);

                if (this.assignedRegistrars.length > 0) {
                    this.selectedRegistrar = this.assignedRegistrars[0];
                    this.loadRegistrarModes(this.selectedRegistrar);
                }
                this.loadingRegistrars.set(false);
            },
            error: (error) => {
                console.error('Error fetching assigned registrars:', error);
                this.loadingRegistrars.set(false);
            },
        });
    }
    private loadRegistrarModes(registrarCode: string) {
        this.registrationMode = [];

        this.registrarsService.getRegistrar(registrarCode).subscribe({
            next: (registrarData) => {
                if (registrarData.allowedRegistrationModeByRegistrar) {
                    this.registrationMode.push({
                        value: 'BY_REGISTRAR',
                        label: this.translate.instant('import.by-registrar'),
                    });
                }
                if (registrarData.allowedRegistrationModeByReservation) {
                    this.registrationMode.push({
                        value: 'BY_RESERVATION',
                        label: this.translate.instant('import.by-reservation'),
                    });
                }
                if (registrarData.allowedRegistrationModeByResolver) {
                    this.registrationMode.push({
                        value: 'BY_RESOLVER',
                        label: this.translate.instant('import.by-resolver'),
                    });
                }

                this.selectedMode = this.registrationMode[0]?.value ?? '';
            },
            error: (error) => {
                console.error('Error fetching registrar data:', error);
            },
        });
    }
    private resetRegistrars() {
        this.assignedRegistrars = [];
        this.selectedRegistrar = '';
        this.registrationMode = [];
        this.selectedMode = '';
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

        // REGISTRAR AND MODE
        record.registrarCode = this.selectedRegistrar;
        record.registrationMode = this.selectedMode;
        if (this.selectedArchiverId) {
            record.archiverId = this.selectedArchiverId;
        }
        if (record.urnNbn) {
            record.urnNbn = this.urnNbn.value;
        }

        // INTELECTUAL ENTITY
        let intelectualEntity: any = {};

        intelectualEntity.id = 0; // nová IE
        intelectualEntity.entityType = this.selectedEntity;

        if (this.documentType.value) {
            intelectualEntity.documentType = this.documentType.value;
        }

        intelectualEntity.bornDigital = this.bornDigital;

        let ieIdentifiers: any = [];

        // TITLE INFO
        if (this.title.value) {
            let titleInfo: any = {};
            titleInfo.type = 'TITLE';
            titleInfo.value = this.title.value;
            ieIdentifiers.push(titleInfo);
        }
        if (this.subTitle.value) {
            let titleInfo: any = {};
            titleInfo.type = 'SUB_TITLE';
            titleInfo.value = this.subTitle.value;
            ieIdentifiers.push(titleInfo);
        }
        if (this.volumeTitle.value) {
            let titleInfo: any = {};
            titleInfo.type = 'VOLUME_TITLE';
            titleInfo.value = this.volumeTitle.value;
            ieIdentifiers.push(titleInfo);
        }
        if (this.issueTitle.value) {
            let titleInfo: any = {};
            titleInfo.type = 'ISSUE_TITLE';
            titleInfo.value = this.issueTitle.value;
            ieIdentifiers.push(titleInfo);
        }

        // IDENTIFIERS
        if (this.ccnb.valid && this.ccnb.value) {
            let identifier: any = {};
            identifier.type = 'CCNB';
            identifier.value = this.ccnb.value;
            ieIdentifiers.push(identifier);
        }
        if (this.isbn.valid && this.isbn.value) {
            let identifier: any = {};
            identifier.type = 'ISBN';
            identifier.value = this.isbn.value;
            ieIdentifiers.push(identifier);
        }
        if (this.issn.valid && this.issn.value) {
            let identifier: any = {};
            identifier.type = 'ISSN';
            identifier.value = this.issn.value;
            ieIdentifiers.push(identifier);
        }
        if (this.otherId.value) {
            let identifier: any = {};
            identifier.type = 'OTHER';
            identifier.value = this.otherId.value;
            ieIdentifiers.push(identifier);
        }
        intelectualEntity.ieIdentifiers = ieIdentifiers;

        // ORIGINATORS
        let originator: any = {};
        // if (this.primaryOriginatorValue.valid && this.primaryOriginatorValue.value) {
        originator.type = this.selectedOriginatorType.toUpperCase() || 'AUTHOR';
        originator.value = this.primaryOriginatorValue.value || ' ';
        intelectualEntity.originator = originator;
        // }
        if (this.otherOriginator.value) {
            intelectualEntity.otherOriginator = this.otherOriginator.value;
        }

        // PUBLICATION
        let publication: any = {};
        if (this.place.value) {
            publication.place = this.place.value;
        }
        if (this.publisher.value) {
            publication.publisher = this.publisher.value;
        }
        if (this.year.value) {
            publication.year = this.year.value;
        }
        if (Object.keys(publication).length > 0) {
            intelectualEntity.publication = publication;
        }

        // SOURCE DOCUMENT (ANALYTICAL)
        let sourceDocument: any = {};
        // TITLE INFO OF SOURCE DOCUMENT
        if (this.sourceDocumentTitle.value) {
            sourceDocument.title = this.sourceDocumentTitle.value;
        }
        if (this.sourceDocumentVolumeTitle.value) {
            sourceDocument.volumeTitle = this.sourceDocumentVolumeTitle.value;
        }
        if (this.sourceDocumentIssueTitle.value) {
            sourceDocument.issueTitle = this.sourceDocumentIssueTitle.value;
        }
        // IDENTIFIERS OF SOURCE DOCUMENT
        if (this.sourceDocumentCcnb.valid && this.sourceDocumentCcnb.value) {
            sourceDocument.ccnb = this.sourceDocumentCcnb.value;
        }
        if (this.sourceDocumentIsbn.valid && this.sourceDocumentIsbn.value) {
            sourceDocument.isbn = this.sourceDocumentIsbn.value;
        }
        if (this.sourceDocumentIssn.valid && this.sourceDocumentIssn.value) {
            sourceDocument.issn = this.sourceDocumentIssn.value;
        }
        if (this.sourceDocumentOtherId.value) {
            sourceDocument.otherId = this.sourceDocumentOtherId.value;
        }
        // PUBLICATION OF SOURCE DOCUMENT
        if (this.sourceDocumentPlace.value) {
            sourceDocument.publicationPlace = this.sourceDocumentPlace.value;
        }
        if (this.sourceDocumentPublisher.value) {
            sourceDocument.publisher = this.sourceDocumentPublisher.value;
        }
        if (this.sourceDocumentYear.value) {
            sourceDocument.publicationYear = this.sourceDocumentYear.value;
        }

        if (Object.keys(sourceDocument).length > 0) {
            intelectualEntity.sourceDocument = sourceDocument;
        }

        // TECHNICAL METADATA
        let technicalMetadata: any = {};

        // FINANCED AND CONTRACT NUMBER

        if (this.financed.value) {
            technicalMetadata.financed = this.financed.value;
        }
        if (this.contractNumber.value) {
            technicalMetadata.contractNumber = this.contractNumber.value;
        }
        // FORMAT
        if (this.formatVersion.value) {
            technicalMetadata.formatVersion = this.formatVersion.value;
        }
        if (this.formatValue.value) {
            technicalMetadata.format = this.formatValue.value;
        }
        // EXTENT
        if (this.extent.value) {
            technicalMetadata.extent = this.extent.value;
        }
        // RESOLUTION
        if (this.resolutionHorizontal.value) {
            technicalMetadata.resolutionHorizontal = Number(this.resolutionHorizontal.value);
        }
        if (this.resolutionVertical.value) {
            technicalMetadata.resolutionVertical = Number(this.resolutionVertical.value);
        }
        // COMPRESSION
        if (this.compression.value) {
            technicalMetadata.compression = this.compression.value;
        }
        // COLOR
        if (this.colorModel.value) {
            technicalMetadata.colorModel = this.colorModel.value;
        }
        if (this.colorDepth.value) {
            technicalMetadata.colorDepth = this.colorDepth.value;
        }
        if (this.iccProfile.value) {
            technicalMetadata.iccProfile = this.iccProfile.value;
        }
        // PICTURE SIZE
        if (this.pictureSizeWidth.value) {
            technicalMetadata.pictureWidth = Number(this.pictureSizeWidth.value);
        }
        if (this.pictureSizeHeight.value) {
            technicalMetadata.pictureHeight = Number(this.pictureSizeHeight.value);
        }
        if (Object.keys(technicalMetadata).length > 0) {
            record.digitalDocument = technicalMetadata;
        }

        record.intelectualEntity = intelectualEntity;
        console.log('record to import', record);
        return record;
    }

    importRecord() {
        this.progressBar.set({ state: true, value: 'edit-running', error: '', urnnbn: '' });
        const record = this.buildRecordToImport();
        console.log('urnnbn', record.urnnbn);
        if (!record) {
            console.error('Record is invalid, cannot import.');
            this.progressBar.set({ state: true, value: '', error: 'no-record', urnnbn: '' });
            setTimeout(() => {
                this.progressBar.set({ state: false, value: '', error: '', urnnbn: '' });
                this.closeSidebar();
            }, 1000);
            return;
        }

        this.apiService.addRecord(record).subscribe({
            next: (data) => {
                console.log('Record imported successfully:', data);
                //TODO: vyčistit formulář pro nové vkládání a nabídnout vytvořený přes odkaz v snackbaru
                //přes přiřazené/potvrezené urnnbn v odpovědi
                //(protože to nebude zaindexované úplně hned, tak proto ne hned router.navigate)
                let urnnbn = 'urn:nbn:cz:' + data.urnNbn.registrarCode + '-' + data.urnNbn.documentCode ;
                this.progressBar.set({ state: true, value: 'import-completed', error: '', urnnbn: urnnbn });
                setTimeout(() => {
                    this.progressBar.set({ state: false, value: '', error: '', urnnbn: '' });
                    this.closeSidebar();
                }, 100000);
            },
            error: (error) => {
                //TODO: snackbar s chybou
                console.error('Error importing record:', error);
                this.progressBar.set({ state: true, value: 'edit-error', error: error.error.message, urnnbn: '' });
                setTimeout(() => {
                    this.progressBar.set({ state: false, value: '', error: '', urnnbn: '' });
                }, 10000);
            },
        });
    }

    onRegistrarChange() {
        console.log('Selected registrar changed to:', this.selectedRegistrar);
        this.registrationMode = [];
        this.registrarsService.getRegistrar(this.selectedRegistrar).subscribe({
            next: (registrarData) => {
                console.log('Selected registrar data:', registrarData);
                if (registrarData.allowedRegistrationModeByRegistrar) {
                    this.registrationMode.push({ value: 'BY_REGISTRAR', label: this.translate.instant('import.by-registrar') });
                }
                if (registrarData.allowedRegistrationModeByReservation) {
                    this.registrationMode.push({ value: 'BY_RESERVATION', label: this.translate.instant('import.by-reservation') });
                }
                if (registrarData.allowedRegistrationModeByResolver) {
                    this.registrationMode.push({ value: 'BY_RESOLVER', label: this.translate.instant('import.by-resolver') });
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
    importButtonState() {
        // tlačítko se aktivuje jen když:
        // - title je validní (required)
        // - ccnb, isbn a issn jsou validní (nebo prázdné)
        const titleValid = this.title.valid;
        const ccnbValid = this.ccnb.valid;
        const isbnValid = this.isbn.valid;
        const issnValid = this.issn.valid;
        const formatValueValid = this.formatValue.valid;
        const formatVersionValid = this.formatVersion.valid;
        const resolutionHorizontalValid = this.resolutionHorizontal.valid;
        const resolutionVerticalValid = this.resolutionVertical.valid;
        const pictureSizeWidthValid = this.pictureSizeWidth.valid;
        const pictureSizeHeightValid = this.pictureSizeHeight.valid;

        const isDisabled =
            !titleValid ||
            !ccnbValid ||
            !isbnValid ||
            !issnValid ||
            !formatValueValid ||
            !formatVersionValid ||
            !resolutionHorizontalValid ||
            !resolutionVerticalValid ||
            !pictureSizeWidthValid ||
            !pictureSizeHeightValid;
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

    positiveNumberValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (value === null || value === undefined || value === '') {
                return null; // prázdné pole je OK
            }
            const num = Number(value);
            if (isNaN(num) || num <= 0) {
                return { invalidPositiveNumber: true };
            }
            return null;
        };
    }
}
