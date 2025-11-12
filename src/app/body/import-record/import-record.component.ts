import { Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ImportRecordService } from '../../services/import-record.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistratorsService } from '../../services/registrators.service';

@Component({
    selector: 'app-import-record',
    standalone: false,
    templateUrl: './import-record.component.html',
    styleUrl: './import-record.component.scss',
})
export class ImportRecordComponent {
    // assignedRegistars = [];
    assignedRegistars = ['aba001', 'boa001'];
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
    ccnb = new FormControl<string>('');
    isbn = new FormControl<string>('');
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

    importRecordSnackBarVisible = signal(false);
    isButtonDisabled = signal(false);

    constructor(
        private importRecordService: ImportRecordService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private registratorsService: RegistratorsService
    ) {}

    ngOnInit(): void {
        console.log('sidebar', this.isSidebarOpen());
        this.translate
            .get(['import.resolver', 'import.reservation', 'import.author', 'import.event', 'import.corporation'])
            .subscribe((translations) => {
                this.registrationMode = [
                    { value: 'resolver', label: translations['import.resolver'] },
                    { value: 'reservation', label: translations['import.reservation'] },
                ];
                this.primaryOriginatorTypes = [
                    { value: 'author', label: translations['import.author'] },
                    { value: 'event', label: translations['import.event'] },
                    { value: 'corporation', label: translations['import.corporation'] },
                ];
                this.selectedMode = this.registrationMode[0].value;
            });

        this.registratorsService.getArchivers().subscribe({
            next: (data) => {
                this.archiverIdsList.set(this.registratorsService.archivers() || []);
                console.log('Archiver IDs for selection:', this.archiverIdsList());
            },
            error: (error) => {
                console.error('Error fetching archiver IDs:', error);
            },
        });

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
    importRecord() {
        this.importRecordSnackBarVisible.set(true);
        setTimeout(() => {
            this.importRecordSnackBarVisible.set(false);
        }, 3000);
    }
}
