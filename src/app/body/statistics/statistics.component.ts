import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';

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

    constructor(private router: Router, private route: ActivatedRoute, private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.route.url.subscribe((url) => {
            if (url.length > 1) {
                this.isActive = url[1].path;
                console.log('Statistics route changed:', this.isActive);
            } else {
                this.router.navigate(['assignments'], { relativeTo: this.route });
            }
        });
        // FILTERS FROM URL
        this.route.queryParams.subscribe((params) => {
            const year = params['year'] || null;
            const registrar = params['registrar'] || null;

            this.selectedYear.set(year);
            this.selectedRegistrar.set(registrar);

            // vždy načteme základní dataset s filtry
            this.reloadData(year, registrar);
        });
    }

    private reloadData(year: string | null, registrar: string | null) {
        const y = year || undefined;
        const r = registrar || undefined;

        this.statisticsService.getCountByDate(r, y).subscribe((data) => {
            this.chartDataByDate.set(data);
        });

        this.statisticsService.getCountByRegistrar(y).subscribe((data) => {
            this.chartDataByRegistrar.set(data);
        });

        if (r) {
            this.statisticsService.getCountByEntityTypes(r, y).subscribe((data) => {
                this.chartDataByEntityTypes.set(data);
            });
        } else {
            this.chartDataByEntityTypes.set([]);
        }
    }

    onYearClick(event: any) {
        if (this.selectedYear()) {
            return;
        }
        const year = event.name;
        const registrar = this.selectedRegistrar();

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                year,
                registrar: registrar || null,
            },
            queryParamsHandling: 'merge',
        });
    }

    onRegistrarClick(event: any) {
        const registrar = event.name;
        const year = this.selectedYear();

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                registrar,
                year: year || null,
            },
            queryParamsHandling: 'merge',
        });
    }

    onYearCancel() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { year: null },
            queryParamsHandling: 'merge',
        });
    }

    onRegistrarCancel() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { registrar: null },
            queryParamsHandling: 'merge',
        });
    }
}
