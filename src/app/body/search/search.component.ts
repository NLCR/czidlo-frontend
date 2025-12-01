import { Component, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SearchService } from '../../services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from '../../services/environment.service';
import { RegistrarsService } from '../../services/registrars.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    registrarCode: string = '';
    registrationMode: Array<{ value: string; label: string }> = [];
    selectedMode: string = '';
    selectedDiId: string = '';

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

    documentType = new FormControl<string>('');
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
        private registrarsService: RegistrarsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
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
            .get([
                'import.resolver',
                'import.reservation',
                'import.author',
                'import.event',
                'import.corporation',
                'import.open',
                'import.restricted',
                'import.unknown',
            ])
            .subscribe((translations) => {
                this.registrationMode = [
                    { value: 'resolver', label: translations['import.resolver'] },
                    { value: 'reservation', label: translations['import.reservation'] },
                ];
                this.primaryOriginatorTypes = [
                    { value: 'AUTHOR', label: translations['import.author'] },
                    { value: 'EVENT', label: translations['import.event'] },
                    { value: 'CORPORATION', label: translations['import.corporation'] },
                ];
                this.diAccessRestrictionsList = [
                    { value: 'UNKNOWN', label: translations['import.unknown'] },
                    { value: 'UNLIMITED_ACCESS', label: translations['import.open'] },
                    { value: 'LIMITED_ACCESS', label: translations['import.restricted'] },
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
                item.ddopen = true;
                item.urnopen = true;
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
        console.log(item);
        this.registrarCode = item.details.registrar.code;
        this.activeAction = 'edit';
        this.selectedItem.set(item);
        this.selectedEntity = item.details?.intelectualEntity?.entityType || item.entitytype;
        this.getArchiversList(item.details.archiver?.id || '');
        let editedItem = item.details;

        // BASIC DETAILS
        this.title = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'TITLE')?.value || '', [
            Validators.required,
        ]);
        this.subTitle = new FormControl<string>(editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'SUB_TITLE')?.value || '');
        this.volumeTitle = new FormControl<string>(
            editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'VOLUME_TITLE')?.value || '',
            [Validators.required]
        );
        this.issueTitle = new FormControl<string>(
            editedItem.intelectualEntity?.ieIdentifiers?.find((id: any) => id.type === 'ISSUE_TITLE')?.value || '',
            [Validators.required]
        );
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
        this.selectedOriginatorType = editedItem.intelectualEntity?.originator?.type || 'AUTHOR';
        this.primaryOriginatorValue = new FormControl<string>(editedItem.intelectualEntity?.originator?.value || '');
        this.otherOriginator = new FormControl<string>(editedItem.intelectualEntity?.otherOriginator || '');
        this.place = new FormControl<string>(editedItem.intelectualEntity?.publication?.place || '');
        this.publisher = new FormControl<string>(editedItem.intelectualEntity?.publication?.publisher || '');
        this.year = new FormControl<string>(editedItem.intelectualEntity?.publication?.year || '');

        this.financed = new FormControl<string>(editedItem.financed || '');
        this.contractNumber = new FormControl<string>(editedItem.contractNumber || '');
        this.selectedArchiverId = item.details.archiver?.id || '';
        this.documentType = new FormControl<string>(editedItem.intelectualEntity?.documentType || '');
        this.bornDigital = editedItem.intelectualEntity?.bornDigital || false;

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
            this.degreeAwardingInstitution = new FormControl<string>(editedItem.intelectualEntity.degreeAwardingInstitution || '');
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
        console.log(item);
        this.activeAction = 'add-instance';
        this.title = new FormControl<string>(item.title);
        this.urnNbn = new FormControl<string>(item.urnnbn);
        let registrarCode = item.details.registrar.code;
        console.log(registrarCode);
        this.getDigitalLibrariesList(registrarCode);
        this.isSidebarOpen.set(true);
    }
    editDigitalInstance(item: any, di: any) {
        console.log(item, di);
        this.activeAction = 'edit-instance';
        this.title = new FormControl<string>(item.title);
        this.urnNbn = new FormControl<string>(item.urnnbn);
        let registrarCode = item.details.registrar.code;
        this.getDigitalLibrariesList(registrarCode);
        console.log(di.id);
        this.selectedDiId = di.id;
        this.selectedDigitalLibraryId = di.digitalLibrary;
        this.diFormat = new FormControl<string>(di.format);
        this.diUrl = new FormControl<string>(di.url);
        this.diAccess = new FormControl<string>(di.accessibility);
        this.selectedDiAccessRestrictionId = di.accessRestriction;
        this.isSidebarOpen.set(true);
    }
    onAddInstanceConfirm() {
        if (this.selectedDiId && this.activeAction === 'edit-instance') {
            console.log('Editing instance:', this.selectedDiId);
            const updatedInstance: any = {
                digitalLibrary: this.selectedDigitalLibraryId,
                format: this.diFormat.value,
                url: this.diUrl.value,
                accessibility: this.diAccess.value,
                accessRestriction: this.selectedDiAccessRestrictionId,
            };
            console.log('Updating instance:', updatedInstance, this.selectedDiId);
            this.searchService.editInstance(this.selectedDiId, updatedInstance).subscribe({
                next: (response) => {
                    console.log('Digital instance updated successfully:', response);
                    this.isSidebarOpen.set(false);
                    this.snackBar.open('Digital instance updated successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    console.error('Error updating digital instance:', error);
                    this.snackBar.open('Error updating digital instance: ' + error.error.message, 'Close');
                },
            });
            return;
        }
        const newInstance: any = {
            // digitalLibraryId: this.selectedDigitalLibraryId,
            format: this.diFormat.value,
            url: this.diUrl.value,
            accessibility: this.diAccess.value,
            accessRestriction: this.selectedDiAccessRestrictionId,
        };
        console.log('Adding new instance:', newInstance, this.urnNbn.value);
        this.searchService.addNewInstance(this.urnNbn.value || '', newInstance).subscribe({
            next: (response) => {
                console.log('New instance added successfully:', response);
                this.isSidebarOpen.set(false);
            },
            error: (error) => {
                console.error('Error adding new instance:', error);

            },
        });
    }
    deactivateURNNBN(item: any) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { data: item, title: 'messages.confirm-deactivate-urnnbn', confirm: 'buttons.confirm-deactivate', reason: '' },
            maxWidth: '800px',
            minWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.confirmed) {
                this.searchService.deactivateUrnnbn(item.urnnbn, result.reason).subscribe({
                    next: (response) => {
                        console.log('URNNBN deactivated successfully:', response);
                        this.getDetails(item);
                    },
                    error: (error) => {
                        console.error('Error deactivating URNNBN:', error);
                    },
                });
            }
        });
    }
    reactivateURNNBN(item: any) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { data: item, title: 'messages.confirm-reactivate-urnnbn', confirm: 'buttons.confirm-reactivate' },
            maxWidth: '800px',
            minWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.searchService.reactivateUrnnbn(item.urnnbn).subscribe({
                    next: (response) => {
                        console.log('URNNBN reactivated successfully:', response);
                        this.getDetails(item);
                    },
                    error: (error) => {
                        console.error('Error reactivating URNNBN:', error);
                    },
                });
            }
        });
    }

    deactivateDigitalInstance(item: any, di: any) {
        console.log('deactivate instance', di);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { data: item, title: 'messages.confirm-deactivate-di', confirm: 'buttons.confirm-deactivate' },
            maxWidth: '800px',
            minWidth: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.searchService.deactivateDigitalInstance(di.id).subscribe({
                    next: (response) => {
                        console.log('Digital instance deactivated successfully:', response);
                        this.getDetails(item);
                    },
                    error: (error) => {
                        console.error('Error deactivating digital instance:', error);
                    },
                });
            }
        });
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
        console.log('Updating record:', record);
        const urnNbn = `urn:nbn:cz:${record.urnNbn.registrarCode}-${record.urnNbn.documentCode}`;
        record.urnNbn = urnNbn;
        this.apiService.editRecordByUrnnbn(urnNbn, record).subscribe({
            next: (data) => {
                console.log('Record updated successfully:', data);
                //TODO: zavřít editační formulář, překreslit detail aktualizovaným záznamem
                this.importRecordSnackBarVisible.set(true);
                setTimeout(() => {
                    this.importRecordSnackBarVisible.set(false);
                }, 3000);
            },
            error: (error) => {
                //TODO: snackbar s chybou
                console.error('Error updating record:', error);
            },
        });
    }

    buildRecordToImport() {
        let record: any = {};

        // REGISTRAR AND MODE
        record.registrarCode = this.registrarCode;
        record.archiverId = this.selectedArchiverId;
        record.urnNbn = this.urnNbn.value;


        // INTELECTUAL ENTITY
        let intelectualEntity: any = {};

        if (this.selectedItem) {
            console.log('Selected item exists:', this.selectedItem());
            intelectualEntity.id = this.selectedItem()?.details?.intelectualEntity?.id;
        }

        intelectualEntity.entityType = this.selectedEntity;
        intelectualEntity.digitalBorn = this.bornDigital;
        if (this.documentType.value) {
            intelectualEntity.documentType = this.documentType.value;
        }

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
        if (this.primaryOriginatorValue.valid && this.primaryOriginatorValue.value) {
            originator.type = this.selectedOriginatorType;
            originator.value = this.primaryOriginatorValue.value;
            intelectualEntity.originator = originator;
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

        if (this.selectedItem()?.details?.digitalDocument) {
            technicalMetadata.id = this.selectedItem()?.details?.digitalDocument?.id;
        }

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
            technicalMetadata.resolutionHorizontal = this.resolutionHorizontal.value;
        }
        if (this.resolutionVertical.value) {
            technicalMetadata.resolutionVertical = this.resolutionVertical.value;
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
            technicalMetadata.pictureWidth = this.pictureSizeWidth.value;
        }
        if (this.pictureSizeHeight.value) {
            technicalMetadata.pictureHeight = this.pictureSizeHeight.value;
        }
        if (Object.keys(technicalMetadata).length > 0) {
            record.digitalDocument = technicalMetadata;
        }

        record.intelectualEntity = intelectualEntity;
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
    openDocumentXmlForUrnnbn(urnnbn: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const xmlUrl = `${publicApiBaseUrl}/urnnbn/${urnnbn}?format=xml`;
        window.open(xmlUrl, '_blank');
    }

    openDocumentJsonForUrnnbn(urnnbn: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const jsonUrl = `${publicApiBaseUrl}/urnnbn/${urnnbn}?format=json`;
        window.open(jsonUrl, '_blank');
    }

    openDocumentXmlForDiId(diId: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const xmlUrl = `${publicApiBaseUrl}/digitalInstances/id/${diId}?format=xml`;
        window.open(xmlUrl, '_blank');
    }
    openDocumentJsonForDiId(diId: string) {
        const publicApiBaseUrl = this.envService.get('czidloPublicApiBaseUrl');
        const jsonUrl = `${publicApiBaseUrl}/digitalInstances/id/${diId}?format=json`;
        window.open(jsonUrl, '_blank');
    }

    isDevMode() {
        return this.envService.get('devMode');
    }
}
