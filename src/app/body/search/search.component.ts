import { Component, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SearchService } from '../../services/search.service';
import { Router, ActivatedRoute } from '@angular/router';

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
    constructor(public searchService: SearchService, private router: Router, private route: ActivatedRoute, private apiService: ApiService) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            if (params['q']) {
                this.searchQuery = params['q'];
                this.selectedType = params['type'] || '';
                this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
                this.searchService.search(this.searchQuery, this.selectedType, this.currentPage).subscribe(() => {
                    this.updatePagination();
                });
            }
        });
    }

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
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

    onSearch(query: string, type?: string) {
        this.currentPage = 1;
        this.updateUrlParams();
        this.searchService.search(query, this.selectedType);
    }

    updateUrlParams() {
        const queryParams: any = {};
        queryParams['page'] = this.currentPage;
        queryParams['q'] = this.searchQuery;
        queryParams['type'] = this.selectedType;
        this.router.navigate([], {
            queryParams: queryParams,
            queryParamsHandling: 'merge',
        });
    }

    getDetails(item: any) {
        this.searchService.getRecordDetails('urn:nbn:cz:nk-0076n5').subscribe({
            next: (response) => {
                console.log('Record details received:', response);
                this.selectedItem.set(response);
            },
            error: (error) => {
                console.error('Error fetching record details:', error);
            },
        });
    }
    onTypeSelected() {
        console.log(this.selectedType);
        this.currentPage = 1;
        this.onSearch(this.searchQuery, this.selectedType);
    }

    onSelectItem(item: any) {
        this.getDetails(item);
        item.opened = !item.opened;
    }

    // PAGINATOR
    changePage(page: number) {
        console.log(page, this.currentPage, this.lastPage);
        if (page < 1 || page > this.lastPage) {
            return;
        }
        this.currentPage = page;
        this.updateUrlParams();
    }
}
