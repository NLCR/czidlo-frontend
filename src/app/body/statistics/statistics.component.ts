import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { RegistrarsService } from '../../services/registrars.service';
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

    states = ['all', 'active', 'inactive'];
    selectedState = signal<string>('all');

    chartDataByDate = signal<Array<{ name: string; value: number }>>([]);
    chartDataByRegistrar = signal<any[]>([]);
    chartDataByEntityTypes = signal<any[]>([]);

    resolvedDataByDate = signal<Array<{ name: string; value: number }>>([]);
    resolvedDataByRegistrar = signal<any[]>([]);

    records = signal<Array<any>>([]);
    selectedYear = signal<string | null>(null);
    selectedRegistrar = signal<string | null>(null);

    colorScheme: any = {
        domain: ['#0080a8', '#00bcd4', '#4dd0e1', '#b2ebf2', '#e0f7fa'],
    };

    constructor(private router: Router, private route: ActivatedRoute, private statisticsService: StatisticsService, private registrarsService: RegistrarsService) {}

    ngOnInit() {
        console.log('statistics init');
        this.registrarsService.getRegistrars().subscribe(
            () => {},
            (error) => {
                console.error('Error loading registrars in statistics component:', error);
            }
        );
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
                state: params['state'] || 'all',
            }))
        );

        // 🟢 Sledujeme změny v URL *i* query parametrech
        combineLatest([url$, filters$]).subscribe(([active, filters]) => {
            this.isActive = active;

            this.selectedYear.set(filters.year);
            this.selectedRegistrar.set(filters.registrar);
            this.selectedState.set(filters.state);

            this.reloadData(filters.year, filters.registrar);
        });

        // FOR TESTING PURPOSES ONLY
        this.statisticsService.getRecords().subscribe((data) => {
            console.log('Records loaded:', data);
        });
    }

    private reloadData(year: string | null, registrar: string | null, state?: string) {
        const y = year || undefined;
        const r = registrar || undefined;
        const s = state || this.selectedState();

        if (this.isActive === 'assignments') {
            this.loadRegisteredData(r, y, s);
        } else if (this.isActive === 'resolvations') {
            this.loadResolvedData(r, y);
        }
    }

    private loadRegisteredData(r?: string, y?: string, s?: string) {
        this.statisticsService.getCountByDate(r, y, s).subscribe((data) => {
            // console.table(data);
            this.chartDataByDate.set(data);
        });

        this.statisticsService.getCountByRegistrar(y, s).subscribe((data) => {
            // console.table(data);
            this.chartDataByRegistrar.set(data);
        });

        // if (r) {
            this.statisticsService.getCountByEntityTypes(r, y).subscribe((data) => {
                // console.table(data);
                this.chartDataByEntityTypes.set(data);
            });
        // } else {
        //     this.chartDataByEntityTypes.set([]);
        // }
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

    onStateChange(newState: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                state: newState,
            },
            queryParamsHandling: 'merge',
        });
    }
}
