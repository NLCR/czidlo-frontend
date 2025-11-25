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

    chartDataByDate = signal<Array<{ name: string; value: number }>>([]);
    chartDataByRegistrar = signal<any[]>([]);
    chartDataByEntityTypes = signal<any[]>([]);

    records = signal<Array<any>>([]);
    selectedYear = signal<string | null>(null);
    selectedRegistrar = signal<string | null>(null);

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
        // COUNT BY YEARS
        this.statisticsService.getCountByDate().subscribe({
            next: (response) => {
                console.log('Records by years for statistics:', response);
                this.chartDataByDate.set(response);
            },
        });
        // COUNT BY REGISTRARS
        this.statisticsService.getCountByRegistrar().subscribe({
            next: (data) => this.chartDataByRegistrar.set(data),
        });
    }

    onYearClick(event: any) {
        if (this.selectedYear()) {
            return;
        }
        const year = event.name; // '2012'
        this.selectedYear.set(year);
        const registrar = this.selectedRegistrar() || null;
        console.log('Clicked year:', event, registrar);

        this.statisticsService.getCountByDate(registrar, year).subscribe({
            next: (data) => this.chartDataByDate.set(data),
            error: (err) => console.error('Error loading months:', err),
        });
        if (registrar) {
            this.statisticsService.getCountByEntityTypes(registrar, year).subscribe({
                next: (data) => this.chartDataByEntityTypes.set(data),
            });
        } else {
            this.statisticsService.getCountByRegistrar(year).subscribe({
                next: (data) => this.chartDataByRegistrar.set(data),
            });
        }
    }

    onRegistrarClick(event: any) {
        const registrar = event.name; // 'XYZ'
        this.selectedRegistrar.set(registrar);
        const year = this.selectedYear() || null;
        console.log('Clicked registrar:', event);

        this.statisticsService.getCountByEntityTypes(registrar).subscribe({
            next: (data) => this.chartDataByEntityTypes.set(data),
            error: (err) => console.error('Error loading entity types:', err),
        });

        if (year) {
            this.statisticsService.getCountByEntityTypes(registrar, year).subscribe({
                next: (data) => this.chartDataByEntityTypes.set(data),
            });
            this.statisticsService.getCountByDate(registrar, year).subscribe({
                next: (data) => this.chartDataByDate.set(data),
            });
        } else {
            this.statisticsService.getCountByRegistrar().subscribe({
                next: (data) => this.chartDataByRegistrar.set(data),
            });
            this.statisticsService.getCountByDate(registrar).subscribe({
                next: (data) => this.chartDataByDate.set(data),
            });
        }
    }

    onYearCancel() {
        this.selectedYear.set(null);
        this.statisticsService.getCountByRegistrar().subscribe({
            next: (data) => this.chartDataByRegistrar.set(data),
        });
        this.statisticsService.getCountByDate().subscribe({
            next: (data) => this.chartDataByDate.set(data),
        });
    }
    onRegistrarCancel() {
        this.selectedRegistrar.set(null);
    }
}
