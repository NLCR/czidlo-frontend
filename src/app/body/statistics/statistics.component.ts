import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-statistics',
    standalone: false,
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
    isActive = 'registered';

    chartData = signal<Array<{ name: string; value: number }>>([]);
    chartDataByYears = signal<Array<{ year: string; count: number }>>([]);
    records = signal<Array<any>>([]);
    recordsCount = signal<number>(0);
    chartDataByMonths = signal<any[]>([]);
    selectedYear = signal<string | null>(null);
    chartDataByRegistrar = signal<any[]>([]);

    colorScheme: any = {
        domain: ['#0080a8', '#00bcd4', '#4dd0e1'],
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private apiService: ApiService
    ) {}

    ngOnInit() {
        this.route.url.subscribe((url) => {
            if (url.length > 1) {
                this.isActive = url[1].path;
                console.log('Statistics route changed:', this.isActive);
            } else {
                this.router.navigate(['assignments'], { relativeTo: this.route });
            }
        });
        // STRUCTURE
        this.apiService.getElasticStructure().subscribe({
            next: (response) => {
                console.log('Elastic structure for statistics:', response);
            },
            error: (error) => {
                console.error('Error fetching elastic structure for statistics:', error);
            },
        });
        // RECORDS
        this.statisticsService.getRecords().subscribe({
            next: (response) => {
                console.log('Records for statistics:', response);
                this.records.set(response.hits.hits);
            },
            error: (error) => {
                console.error('Error fetching records count for statistics:', error);
            },
        });
        // RECORDS COUNT
        this.statisticsService.getRecordsCount().subscribe({
            next: (response) => {
                console.log('Records count for statistics:', response);
                this.recordsCount.set(response.count);
            },
            error: (error) => {
                console.error('Error fetching records count for statistics:', error);
            },
        });
        // COUNT BY ENTITY TYPES
        this.statisticsService.getCountByEntityTypes().subscribe({
            next: (response) => {
                console.log('Entity types for statistics:', response);
                this.chartData.set(response);
            },
            error: (error) => {
                console.error('Error fetching records count for statistics:', error);
            },
        });
        // COUNT BY YEARS
        this.statisticsService.getCountByYears().subscribe({
            next: (response) => {
                console.log('Records by years for statistics:', response);
                this.chartDataByYears.set(response);
            },
        });
        // COUNT BY REGISTRARS
        this.statisticsService.getCountByRegistrar().subscribe({
            next: (data) => this.chartDataByRegistrar.set(data),
        });
        const body = {
            query: {
                match_all: {},
            },
            size: 100, // kolik chceš – max 10k
        };

        this.apiService.getRecords3(body).subscribe({
            next: (response) => {
                console.log('Records 3 for statistics:', response);
            },
            error: (error) => {
                console.error('Error fetching records 3 for statistics:', error);
            },
        });
    }
    onYearClick(event: any) {
        const year = event.name; // '2012'
        console.log('Clicked year:', event);
        this.loadMonthsForYear(year);
        this.statisticsService.getCountByRegistrarForYear(year).subscribe({
            next: (data) => this.chartDataByRegistrar.set(data),
        });
    }
    loadMonthsForYear(year: string) {
        this.selectedYear.set(year);

        this.statisticsService.getCountByMonths(year).subscribe({
            next: (data) => this.chartDataByMonths.set(data),
            error: (err) => console.error('Error loading months:', err),
        });
    }
    onBackClick() {
        this.selectedYear.set(null);
        this.chartDataByMonths.set([]);
    }
}
