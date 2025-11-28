import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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

    resolvedDataByDate = signal<Array<{ name: string; value: number }>>([]);
    resolvedDataByRegistrar = signal<any[]>([]);

    records = signal<Array<any>>([]);
    selectedYear = signal<string | null>(null);
    selectedRegistrar = signal<string | null>(null);

    colorScheme: any = {
        domain: ['#0080a8', '#00bcd4', '#4dd0e1'],
    };

    constructor(private router: Router, private route: ActivatedRoute, private statisticsService: StatisticsService) {}

    ngOnInit() {
        const url$ = this.route.url.pipe(
            map((url) => {
                if (url.length > 1) {
                    return url[1].path;
                } else {
                    this.router.navigate(['assignments'], { relativeTo: this.route });
                    return 'assignments';
                }
            })
        );

        const filters$ = this.route.queryParams.pipe(
            map((params) => ({
                year: params['year'] || null,
                registrar: params['registrar'] || null,
            }))
        );

        // 🟢 Sledujeme změny v URL *i* query parametrech
        combineLatest([url$, filters$]).subscribe(([active, filters]) => {
            this.isActive = active;

            this.selectedYear.set(filters.year);
            this.selectedRegistrar.set(filters.registrar);

            this.reloadData(filters.year, filters.registrar);
        });
    }

    private reloadData(year: string | null, registrar: string | null) {
        const y = year || undefined;
        const r = registrar || undefined;

        if (this.isActive === 'assignments') {
            this.loadRegisteredData(r, y);
        } else if (this.isActive === 'resolvations') {
            this.loadResolvedData(r, y);
        }
    }

    private loadRegisteredData(r?: string, y?: string) {
        this.statisticsService.getCountByDate(r, y).subscribe((data) => {
            // console.table(data);
            this.chartDataByDate.set(data);
        });

        this.statisticsService.getCountByRegistrar(y).subscribe((data) => {
            // console.table(data);
            this.chartDataByRegistrar.set(data);
        });

        if (r) {
            this.statisticsService.getCountByEntityTypes(r, y).subscribe((data) => {
                // console.table(data);
                this.chartDataByEntityTypes.set(data);
            });
        } else {
            this.chartDataByEntityTypes.set([]);
        }
    }
    private loadResolvedData(r?: string, y?: string) {
        this.statisticsService.getResolvedByDate(r, y).subscribe((data) => {
            // console.table(data);
            this.resolvedDataByDate.set(data);
        });

        this.statisticsService.getResolvedByRegistrar(y).subscribe((data) => {
            console.table(data);
            this.resolvedDataByRegistrar.set(data);
        });
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
