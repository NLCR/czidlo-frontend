import { Component, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SearchService } from '../../services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from '../../services/environment.service';
import { RegistrarsService } from '../../services/registrars.service';

@Component({
    selector: 'app-search',
    standalone: false,
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit {
    @ViewChild('searchInput') searchInput!: ElementRef;
    searchQuery: string = '';
    selectedType: string = '';
    selectedItem = signal<any>(null);
    activeAction: string = '';

    // PAGINATION
    pages: any[] = [];
    displayedFirstPages: any[] = [];
    displayedMiddlePages: any[] = [];
    displayedLastPages: any[] = [];
    currentPage: number = 1;
    lastPage: number = 1;
    from: number = 0;
    to: number = 0;
    count: number = 0;
    isAdmin = signal(true); // TODO: nahradit reálnou kontrolou práv

    isSidebarOpen = signal(false);

    // EDIT RECORD
    selectedEntity: string = '';
    registrationMode: Array<{ value: string; label: string }> = [];
    selectedMode: string = '';

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
    compression = new FormControl<string>('');
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

    // DIGITAL INSTANCES
    digitalLibrariesList = signal<Array<any>>([]);
    selectedDigitalLibraryId = '';
    diFormat = new FormControl<string>('');
    diUrl = new FormControl<string>('');
    diAccess = new FormControl<string>('');
    selectedDiAccessRestrictionId = '';
    diAccessRestrictionsList: Array<{ value: string; label: string }> = [];

    constructor(
        public searchService: SearchService,
        private router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private envService: EnvironmentService,
        private translate: TranslateService,
        private registrarsService: RegistrarsService
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const q = params['q'] ?? '';
            const type = params['type'] ?? '';
            const page = params['page'] ? parseInt(params['page'], 10) : 1;

            this.searchQuery = q;
            this.selectedType = type;
            this.currentPage = page;

            this.searchService.search(q, type, page).subscribe(() => {
                this.updatePagination();
            });
        });

        this.apiService.getRecordCount().subscribe({
            next: (response) => {
                console.log('Record count received:', response);
            },
        });

        this.translate
            .get(['import.resolver', 'import.reservation', 'import.author', 'import.event', 'import.corporation', 'import.open', 'import.restricted', 'import.unknown'])
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
                this.diAccessRestrictionsList = [
                    { value: 'UNKNOWN', label: translations['import.unknown'] },
                    { value: 'OPEN', label: translations['import.open'] },
                    { value: 'RESTRICTED', label: translations['import.restricted'] },
                ];
                this.selectedMode = this.registrationMode[0].value;
                this.selectedDiAccessRestrictionId = this.diAccessRestrictionsList[0].value;
            });
    }

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    onSearch(query: string, type?: string) {
        this.currentPage = 1;
        this.router.navigate([], {
            queryParams: {
                q: query || null,
                type: type ?? (this.selectedType || null),
                page: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

    updateUrlParams() {
        const queryParams: any = {};
        if (this.searchQuery) {
            queryParams['q'] = this.searchQuery;
        } else {
            queryParams['q'] = null;
        }
        if (this.selectedType) {
            queryParams['type'] = this.selectedType;
        } else {
            queryParams['type'] = null;
        }
        if (this.currentPage) {
            queryParams['page'] = this.currentPage;
        }
        this.router.navigate([], {
            queryParams: queryParams,
            queryParamsHandling: 'merge',
        });
    }

    getDetails(item: any) {
        this.searchService.getRecordDetails(item.urnnbn).subscribe({
            next: (response) => {
                console.log('Record details received:', response);
                this.selectedItem.set(response);
                item.details = response;
            },
            error: (error) => {
                console.error('Error fetching record details:', error);
                item.loading = false;
            },
            complete: () => {
                console.log('Record details fetch complete', item.details);
                item.opened = true;
                item.loading = false;
            },
        });
    }
    onTypeSelected() {
        console.log(this.selectedType);
        this.currentPage = 1;
        this.onSearch(this.searchQuery, this.selectedType);
    }

    onSelectItem(item: any) {
        if (!item.details) {
            item.loading = true;
            this.getDetails(item);
        } else {
            item.opened = !item.opened;
        }
    }
    toggleSdInfo(item: any) {
        console.log(item.sdtitleopen);
        item.sdtitleopen = !item.sdtitleopen;
    }
    getArchiversList(selectedArchiverId: string) {
        return this.registrarsService.getArchivers().subscribe({
            next: (response) => {
                console.log('Archivers received:', response);
                this.archiverIdsList.set(response.items);
                this.selectedArchiverId = selectedArchiverId;
            },
            error: (error) => {
                console.error('Error fetching archivers:', error);
                return [];
            },
            complete: () => {
                console.log('Archivers fetch complete');
            },
        });
    }
    getDigitalLibrariesList(registrarCode: string) {
        return this.registrarsService.getDigitalLibrariesByRegistrar(registrarCode).subscribe({
            next: (response) => {
                console.log('Digital libraries received:', response);
                this.digitalLibrariesList.set(response.digitalLibraries || []);
                this.selectedDigitalLibraryId = response.digitalLibraries.length > 0 ? response.digitalLibraries[0].id : '';
            },
            error: (error) => {
                console.error('Error fetching digital libraries:', error);
                return [];
            },
            complete: () => {
                console.log('Digital libraries fetch complete');
            },
        });
    }

    editItem(item: any) {
        this.activeAction = 'edit';
        this.selectedItem.set(item);
        this.getArchiversList(item.details.archiver?.id || '');
        let editedItem = item.details;
        this.selectedEntity = item.documenttype;
        let entity = this.selectedEntity.toLowerCase();
        // BASIC DETAILS
        this.title = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'TITLE')?.value || '', [
            Validators.required,
        ]);
        this.subTitle = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'SUB_TITLE')?.value || '');
        this.ccnb = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'CCNB')?.value || '', [
            this.ccnbValidator(),
        ]);
        this.isbn = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'ISBN')?.value || '', [
            this.isbnValidator(),
        ]);
        this.issn = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'ISSN')?.value || '', [
            this.issnValidator(),
        ]);
        this.otherId = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'OTHER')?.value || '');
        this.selectedOriginatorType = editedItem.intelectualEntity?.originator.type.toLowerCase() || 'author';
        this.primaryOriginatorValue = new FormControl<string>(editedItem.intelectualEntity?.originator.value || '');
        this.otherOriginator = new FormControl<string>(editedItem.intelectualEntity?.otherOriginator || '');
        this.place = new FormControl<string>(editedItem.intelectualEntity?.publication?.place || '');
        this.publisher = new FormControl<string>(editedItem.intelectualEntity?.publication?.publisher || '');
        this.year = new FormControl<string>(editedItem.intelectualEntity?.publication?.year || '');

        this.financed = new FormControl<string>(editedItem.financed || '');
        this.contractNumber = new FormControl<string>(editedItem.contractNumber || '');
        this.selectedArchiverId = item.details.archiver?.id || '';

        this.urnNbn = new FormControl<string>(editedItem.urnNbn || '');
        // TECHNICAL METADATA
        this.formatValue = new FormControl<string>(editedItem.digitalDocument?.format || '');
        this.formatVersion = new FormControl<string>(editedItem.digitalDocument?.formatVersion || '');
        this.extent = new FormControl<string>(editedItem.digitalDocument?.extent || '');
        this.resolutionHorizontal = new FormControl<string>(editedItem.digitalDocument?.resolutionHorizontal || '');
        this.resolutionVertical = new FormControl<string>(editedItem.digitalDocument?.resolutionVertical || '');
        this.compression = new FormControl<string>(editedItem.digitalDocument?.compression || '');
        // this.compressionRatio = new FormControl<string>(editedItem.digitalDocument?.compression || '');
        // this.compressionValue = new FormControl<string>(editedItem.digitalDocument?.compression.value || '');
        this.colorModel = new FormControl<string>(editedItem.digitalDocument?.colorModel || '');
        this.colorDepth = new FormControl<string>(editedItem.digitalDocument?.colorDepth || '');
        this.iccProfile = new FormControl<string>(editedItem.digitalDocument?.iccProfile || '');
        this.pictureSizeWidth = new FormControl<string>(editedItem.digitalDocument?.pictureWidth || '');
        this.pictureSizeHeight = new FormControl<string>(editedItem.digitalDocument?.pictureHeight || '');

        if (this.selectedEntity === 'THESIS') {
            this.degreeAwardingInstitution = new FormControl<string>(editedItem[entity].degreeAwardingInstitution || '');
        }
        if (this.selectedEntity === 'ANALYTICAL') {
            this.sourceDocumentTitle = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.title || '');
            this.sourceDocumentVolumeTitle = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.volumeTitle || '');
            this.sourceDocumentIssueTitle = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.issueTitle || '');
            this.sourceDocumentCcnb = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.ccnb || '', [this.ccnbValidator()]);
            this.sourceDocumentIsbn = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.isbn || '', [this.isbnValidator()]);
            this.sourceDocumentIssn = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.issn || '', [this.issnValidator()]);
            this.sourceDocumentOtherId = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.otherId || '');
            this.sourceDocumentPlace = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.publication?.place || '');
            this.sourceDocumentPublisher = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.publication?.publisher || '');
            this.sourceDocumentYear = new FormControl<string>(editedItem.intelectualEntity?.sourceDocument?.publication?.year || '');
        }

        this.isSidebarOpen.set(true);
    }

    addInstance(item: any) {
        this.activeAction = 'add-instance';
        this.title = new FormControl<string>(item.title);
        let registrarCode = item.details.registrar.code;
        console.log(registrarCode);
        this.getDigitalLibrariesList(registrarCode);
        this.isSidebarOpen.set(true);
    }
    onAddInstanceConfirm() {
        const newInstance: any = {
            digitalLibraryId: this.selectedDigitalLibraryId,
            format: this.diFormat.value,
            url: this.diUrl.value,
            access: this.diAccess.value,
            accessRestriction: this.selectedDiAccessRestrictionId,
        };
        console.log('Adding new instance:', newInstance);
        // Zde by následoval kód pro odeslání nové instance na server
    }
    deactivateURNNBN(item: any) {
        console.log('Deactivate URNNBN for item', item);
    }
    reactivateURNNBN(item: any) {
        console.log('Reactivate URNNBN for item', item);
    }

    closeSidebar() {
        this.isSidebarOpen.set(false);
    }
    onEditRecordConfirm() {
        const record = this.buildRecordToImport();
        if (!record) {
            console.error('Record is invalid, cannot import.');
            return;
        }
        console.log('Importing record:', record);
        // Zde by následoval kód pro odeslání záznamu na server
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

    // PAGINATOR
    changePage(page: number) {
        if (page < 1 || page > this.lastPage) return;

        this.router.navigate([], {
            queryParams: {
                q: this.searchQuery || null,
                type: this.selectedType || null,
                page: page,
            },
            queryParamsHandling: 'merge',
        });
    }

    updatePagination() {
        this.count = this.searchService.recordsCount();

        // Výpočet from/to
        this.from = (this.currentPage - 1) * 100 + 1;
        this.to = Math.min(this.currentPage * 100, this.count);

        // Vygeneruj všechny stránky
        this.pages = Array.from({ length: Math.ceil(this.count / 100) }, (_, i) => i + 1);
        this.lastPage = this.pages.length;

        // Výchozí prázdné
        this.displayedFirstPages = [];
        this.displayedMiddlePages = [];
        this.displayedLastPages = [];

        if (this.lastPage <= 4) {
            // Málo stránek → zobraz všechny
            this.displayedFirstPages = this.pages;
            return;
        }

        // === Máme více než 4 stránky ===

        if (this.currentPage <= 3) {
            // U prvních stran
            this.displayedFirstPages = this.pages.slice(0, 3);
            this.displayedLastPages = [this.lastPage];
            return;
        }

        if (this.currentPage >= this.lastPage - 2) {
            // U posledních stran
            this.displayedFirstPages = [1];
            this.displayedLastPages = this.pages.slice(this.lastPage - 3);
            return;
        }

        // Střed – jsme někde mezi
        this.displayedFirstPages = [1];
        this.displayedMiddlePages = this.pages.slice(this.currentPage - 1, this.currentPage + 2);
        this.displayedLastPages = [this.lastPage];
    }

    openDocumentXml(urnnbn: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const xmlUrl = `${publicApiBaseUrl}/resolver/${urnnbn}?format=xml`;
        window.open(xmlUrl, '_blank');
    }

    openDocumentJson(urnnbn: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const jsonUrl = `${publicApiBaseUrl}/resolver/${urnnbn}?format=json`;
        window.open(jsonUrl, '_blank');
    }
}
