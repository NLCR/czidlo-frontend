import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

    constructor(private apiService: ApiService) {}

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();

    const body = {
      query: {
        match_all: {},
      },
      size: 100, // kolik chceš – max 10k
    };

    this.apiService.getRecords(body).subscribe({
      next: (response) => {
        console.log('Records from search component:', response);
      },
      error: (error) => {
        console.error('Error fetching records count:', error);
      }
    });
  }
}
