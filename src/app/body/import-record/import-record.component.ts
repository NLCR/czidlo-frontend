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
            .subscribe((translations) => {
                this.primaryOriginatorTypes = [
                    { value: 'author', label: translations['import.author'] },
                    { value: 'event', label: translations['import.event'] },
                    { value: 'corporation', label: translations['import.corporation'] },
                ];
                this.selectedMode = this.registrationMode[0].value;
            });

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

        // REGISTRAR AND MODE
        record.registrarCode = this.selectedRegistrar;
        record.registrationMode = this.selectedMode;
        record.intellectualEntity = this.selectedEntity;
        record.archiverId = this.selectedArchiverId;
        record.financed = this.financed.value;
        record.contractNumber = this.contractNumber.value;
        record.documentType = this.documentType.value;
        record.bornDigital = this.bornDigital;
        record.urnNbn = this.urnNbn.value;

        // INTELECTUAL ENTITY
        let intelectualEntity: any = {};
        let titleInfo: any = {};

        // TITLE INFO
        if (this.title.value) {
            titleInfo.title = this.title.value;
        }
        if (this.subTitle.value) {
            titleInfo.subTitle = this.subTitle.value;
        }
        if (this.monographTitle.value) {
            titleInfo.monographTitle = this.monographTitle.value;
        }
        if (this.periodicalTitle.value) {
            titleInfo.periodicalTitle = this.periodicalTitle.value;
        }
        if (this.volumeTitle.value) {
            titleInfo.volumeTitle = this.volumeTitle.value;
        }
        if (this.issueTitle.value) {
            titleInfo.issueTitle = this.issueTitle.value;
        }
        intelectualEntity.titleInfo = titleInfo;

        // IDENTIFIERS
        if (this.ccnb.valid && this.ccnb.value) {
            intelectualEntity.ccnb = this.ccnb.value;
        }
        if (this.isbn.valid && this.isbn.value) {
            intelectualEntity.isbn = this.isbn.value;
        }
        if (this.issn.valid && this.issn.value) {
            intelectualEntity.issn = this.issn.value;
        }
        if (this.otherId.value) {
            intelectualEntity.otherId = this.otherId.value;
        }

        // ORIGINATORS
        let primaryOriginator: any = {};
        if (this.primaryOriginatorValue.valid && this.primaryOriginatorValue.value) {
            primaryOriginator.type = this.selectedOriginatorType;
            primaryOriginator.value = this.primaryOriginatorValue.value;
            intelectualEntity.primaryOriginator = primaryOriginator;
        }
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

        // SOURCE DOCUMENT (ANALYTICAL)
        let sourceDocument: any = {};
        // TITLE INFO OF SOURCE DOCUMENT
        let sourceTitleInfo: any = {};
        if (this.sourceDocumentTitle.value) {
            sourceTitleInfo.title = this.sourceDocumentTitle.value;
        }
        if (this.sourceDocumentVolumeTitle.value) {
            sourceTitleInfo.volumeTitle = this.sourceDocumentVolumeTitle.value;
        }
        if (this.sourceDocumentIssueTitle.value) {
            sourceTitleInfo.issueTitle = this.sourceDocumentIssueTitle.value;
        }
        if (Object.keys(sourceTitleInfo).length > 0) {
            sourceDocument.titleInfo = sourceTitleInfo;
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
        let sourcePublication: any = {};
        if (this.sourceDocumentPlace.value) {
            sourcePublication.place = this.sourceDocumentPlace.value;
        }
        if (this.sourceDocumentPublisher.value) {
            sourcePublication.publisher = this.sourceDocumentPublisher.value;
        }
        if (this.sourceDocumentYear.value) {
            sourcePublication.year = this.sourceDocumentYear.value;
        }
        if (Object.keys(sourcePublication).length > 0) {
            sourceDocument.publication = sourcePublication;
        }

        if (Object.keys(sourceDocument).length > 0) {
            intelectualEntity.sourceDocument = sourceDocument;
        }

        // TECHNICAL METADATA
        let technicalMetadata: any = {};
        // FORMAT
        let format: any = {};
        if (this.formatVersion.value) {
            format.version = this.formatVersion.value;
        }
        if (this.formatValue.value) {
            format.format = this.formatValue.value;
        }
        if (Object.keys(format).length > 0) {
            technicalMetadata.format = format;
        }
        // EXTENT
        if (this.extent.value) {
            technicalMetadata.extent = this.extent.value;
        }
        // RESOLUTION
        let resolution: any = {};
        if (this.resolutionHorizontal.value) {
            resolution.horizontal = this.resolutionHorizontal.value;
        }
        if (this.resolutionVertical.value) {
            resolution.vertical = this.resolutionVertical.value;
        }
        if (Object.keys(resolution).length > 0) {
            technicalMetadata.resolution = resolution;
        }
        // COMPRESSION
        let compression: any = {};
        if (this.compressionValue.value) {
            compression.value = this.compressionValue.value;
        }
        if (this.compressionRatio.value) {
            compression.ratio = this.compressionRatio.value;
        }
        if (Object.keys(compression).length > 0) {
            technicalMetadata.compression = compression;
        }
        // COLOR
        let color: any = {};
        if (this.colorModel.value) {
            color.model = this.colorModel.value;
        }
        if (this.colorDepth.value) {
            color.depth = this.colorDepth.value;
        }
        if (this.iccProfile.value) {
            color.iccProfile = this.iccProfile.value;
        }
        if (Object.keys(color).length > 0) {
            technicalMetadata.color = color;
        }
        // PICTURE SIZE
        let pictureSize: any = {};
        if (this.pictureSizeWidth.value) {
            pictureSize.width = this.pictureSizeWidth.value;
        }
        if (this.pictureSizeHeight.value) {
            pictureSize.height = this.pictureSizeHeight.value;
        }
        if (Object.keys(pictureSize).length > 0) {
            technicalMetadata.pictureSize = pictureSize;
        }
        if (Object.keys(technicalMetadata).length > 0) {
            record.technicalMetadata = technicalMetadata;
        }

        record.intellectualEntity = intelectualEntity;
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
