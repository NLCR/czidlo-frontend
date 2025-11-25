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

    constructor(public searchService: SearchService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            if (params['q']) {
                this.searchQuery = params['q'];
                this.selectedType = params['type'] || '';
                this.searchService.search(this.searchQuery, this.selectedType).subscribe();
            }
        });
    }

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    onSearch(query: string, type?: string) {
        this.router.navigate([], {
            queryParams: {
                q: query || null,
                type: this.selectedType || null,
            },
            queryParamsHandling: 'merge',
        });

        this.searchService.search(query, this.selectedType);
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
        this.onSearch(this.searchQuery, this.selectedType);
    }

    onSelectItem(item: any) {
        this.getDetails(item);
        item.opened = !item.opened;
    }
}
