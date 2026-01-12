import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { RegistrarsService } from '../../services/registrars.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
    chartDataByRegistrarTable = signal<any[]>([]);
    chartDataByEntityTypes = signal<any[]>([]);

    resolvedDataByDate = signal<Array<{ name: string; value: number }>>([]);
    resolvedDataByRegistrar = signal<any[]>([]);

    records = signal<Array<any>>([]);
    selectedYear = signal<string | null>(null);
    selectedRegistrar = signal<string | null>(null);
    selectedType = signal<string | null>(null);

    colorScheme: any = {
        domain: ['#0080a8', '#00bcd4', '#4dd0e1', '#b2ebf2', '#e0f7fa'],
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private registrarsService: RegistrarsService,
        private translate: TranslateService
    ) {}

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
                type: params['type'] || null,
            }))
        );

        // 🟢 Sledujeme změny v URL *i* query parametrech
        combineLatest([url$, filters$]).subscribe(([active, filters]) => {
            this.isActive = active;

            this.selectedYear.set(filters.year);
            this.selectedRegistrar.set(filters.registrar);
            this.selectedState.set(filters.state);
            this.selectedType.set(filters.type);

            this.reloadData(filters.year, filters.registrar, filters.state, filters.type);
        });

        // FOR TESTING PURPOSES ONLY
        this.statisticsService.getRecords().subscribe((data) => {
            console.log('Records loaded:', data);
        });
    }

    private reloadData(year: string | null, registrar: string | null, state?: string, type?: any) {
        const y = year || undefined;
        const r = registrar || undefined;
        const s = state || this.selectedState();
        const t = type || this.selectedType();

        console.log('type', t);

        if (this.isActive === 'assignments') {
            this.loadRegisteredData(r, y, s, t);
        } else if (this.isActive === 'resolvations') {
            this.loadResolvedData(r, y);
        }
    }

    private loadRegisteredData(r?: string, y?: string, s?: string, t?: string) {
        console.log(r, y, s, t);
        // DATE
        this.statisticsService.getCountByDate(r, y, s, t).subscribe((data) => {
            // console.table(data);
            this.chartDataByDate.set(data);
        });
        // REGISTRAR
        this.statisticsService.getCountByRegistrar(r, y, s, t).subscribe((data) => {
            // console.table(data);
            // TABULKA – beze změny
            this.chartDataByRegistrarTable.set(data);
            // GRAF – malé hodnoty sloučené do "Other"
            const chartData = this.prepareChartDataWithOther(data, 1);
            this.chartDataByRegistrar.set(chartData);
        });
        // ENTITY TYPES
        this.statisticsService.getCountByEntityTypes(r, y, s, t).subscribe((data) => {
            const keys = data.map((i: any) => `${i.name}`);

            this.translate.get(keys).subscribe((translations: any) => {
                const translatedData = data.map((i: any) => ({
                    label: translations[i.name] || i.name,
                    name: i.name,
                    value: i.value,
                }));
            this.chartDataByEntityTypes.set(translatedData);
            });
        });
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
        if (registrar === 'další') {
            return;
        }
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

    onTypeClick(event: any) {
        const type = event.name;
        console.log(event);

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                type,
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

    onTypeCancel() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { type: null },
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

    private prepareChartDataWithOther(items: any[], thresholdPercent = 4, otherName = 'další', otherTitle = 'Other'): any[] {
        if (!items?.length) return [];
        const total = items.reduce((sum, i) => sum + i.value, 0);
        if (total === 0) return items;

        const thresholdValue = (thresholdPercent / 100) * total;
        const result: any[] = [];
        let otherSum = 0;
        for (const item of items) {
            if (item.value < thresholdValue) {
                otherSum += item.value;
            } else {
                result.push({ ...item });
            }
        }
        if (otherSum > 0) {
            result.push({
                name: otherName,
                title: otherTitle,
                value: otherSum,
            });
        }

        // graf je přehlednější, když je seřazený
        // result.sort((a, b) => b.value - a.value);

        return result;
    }
}
