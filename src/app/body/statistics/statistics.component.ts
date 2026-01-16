import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StatisticsService } from '../../services/statistics.service';
import { RegistrarsService } from '../../services/registrars.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-statistics',
    standalone: false,
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
    isActive = 'registered';

    states = ['all', 'active', 'inactive'];
    selectedState: string = 'all';
    bornDigitalStates = ['all', 'digital', 'analog'];
    selectedBornDigitalState: string = 'all';

    // ASSIGNMENTS
    chartDataByDate = signal<Array<{ name: string; value: number }>>([]);
    chartDataByRegistrar = signal<any[]>([]);
    chartDataByRegistrarTable = signal<any[]>([]);
    chartDataByEntityTypes = signal<any[]>([]);

    // RESOLVATIONS
    resolvedDataByDate = signal<Array<{ name: string; value: number }>>([]);
    resolvedDataByRegistrar = signal<any[]>([]);
    resolvedDataByRegistrarTable = signal<any[]>([]);
    resolvedDataByEntityTypes = signal<any[]>([]);

    records = signal<Array<any>>([]);
    selectedYear = signal<string | null>(null);
    selectedRegistrar = signal<string | null>(null);
    selectedType = signal<string | null>(null);

    @ViewChild('sourceDiv') sourceDiv!: ElementRef<HTMLElement>;
    colorScheme: any = {
        // domain: ['#0080a8', '#00bcd4', '#0097a7', '#4dd0e1', '#b2ebf2'],
        // domain: [
        //     '#4FA3C4', // zesvětlená tyrkysová (hlavní)

        //     '#B06B6B', // zesvětlená červenohnědá
        //     '#C4925D', // zesvětlená oranžová
        //     '#B3B86A', // zesvětlená olivová
        //     '#82A883', // zesvětlená zelená
        //     '#77b2b8ff', // zesvětlená zelenomodrá
        //     '#8796C4', // zesvětlená modrá
        //     '#A48AC4', // zesvětlená fialová
        //     '#A0A0A0', // zesvětlená šedá
        //     '#7D919B', // zesvětlená šedomodrá
        // ],
        domain: [
            '#2F93B8', // živější tyrkysová (hlavní)

            '#C04A4A', // živější tlumená červená
            '#D08A3C', // živější oranžová
            '#dde032ff', // žluto-olivová
            '#5FAF6A', // zelená
            '#3FA6A0', // zelenomodrá
            '#4F6FB8', // modrá
            '#8C63B8', // fialová
            '#8C8C8C', // neutrální šedá
            '#4F6E7A', // šedomodrá
        ],
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private registrarsService: RegistrarsService,
        private translate: TranslateService,
        private snackbar: MatSnackBar
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
                born: params['born'] || 'all',
            }))
        );

        // 🟢 Sledujeme změny v URL *i* query parametrech
        combineLatest([url$, filters$]).subscribe(([active, filters]) => {
            this.isActive = active;

            console.log(filters.state);

            this.selectedYear.set(filters.year);
            this.selectedRegistrar.set(filters.registrar);
            this.selectedState = filters.state;
            this.selectedBornDigitalState = filters.born;
            this.selectedType.set(filters.type);

            this.reloadData(filters.year, filters.registrar, filters.state, filters.type, filters.born);
        });

        // FOR TESTING PURPOSES ONLY
        this.statisticsService.getRecords().subscribe((data) => {
            console.log('Records loaded:', data);
        });
    }
    ngAfterViewInit(): void {
        console.log(this.getCalculatedWidth());
    }

    getCalculatedWidth(): number {
        return this.sourceDiv?.nativeElement.clientWidth ?? 0;
    }
    getCalculatedWidthHalf(): number {
        return (this.sourceDiv?.nativeElement.clientWidth ?? 0) / 2;
    }

    private reloadData(year: string | null, registrar: string | null, state?: string, type?: any, born?: string) {
        const y = year || undefined;
        const r = registrar || undefined;
        const s = state || this.selectedState;
        const t = type || this.selectedType();
        const b = born || this.selectedBornDigitalState;

        if (this.isActive === 'assignments') {
            this.loadRegisteredData(r, y, s, t, b);
        } else if (this.isActive === 'resolvations') {
            this.loadResolvedData(r, y);
        }
    }

    private loadRegisteredData(r?: string, y?: string, s?: string, t?: string, b?: string) {
        console.log(r, y, s, t, b);
        // DATE
        this.statisticsService.getCountByDate(r, y, s, t, b).subscribe((data) => {
            this.chartDataByDate.set(data);
        });
        // REGISTRAR
        this.statisticsService.getCountByRegistrar(r, y, s, t, b).subscribe((data) => {
            // console.table(data);
            // TABULKA – beze změny
            this.chartDataByRegistrarTable.set(data);
            // GRAF – malé hodnoty sloučené do "Other"
            const chartData = this.prepareChartDataWithOther(data, 1);
            this.chartDataByRegistrar.set(chartData);
        });
        // ENTITY TYPES
        this.statisticsService.getCountByEntityTypes(r, y, s, t, b).subscribe((data) => {
            if (!Array.isArray(data) || data.length === 0) {
                this.chartDataByEntityTypes.set([]);
                return;
            }
            const keys = data?.map((i: any) => `${i.name}`) || [];

            this.translate.get(keys).subscribe((translations: any) => {
                const translatedData = data.map((i: any) => ({
                    name: translations[i.name] || i.name,
                    // name: i.name,
                    value: i.value,
                    extra: { id: i.name },
                }));
                console.log(translatedData);
                this.chartDataByEntityTypes.set(translatedData);
            });
        });
    }

    private loadResolvedData(r?: string, y?: string, s?: string, t?: string, b?: string) {
        // DATE
        this.statisticsService.getResolvedByDate(r, y, s, t, b).subscribe((data) => {
            this.resolvedDataByDate.set(data);
        });
        // REGISTRAR
        this.statisticsService.getResolvedByRegistrar(r, y, s, t, b).subscribe((data) => {
            this.resolvedDataByRegistrarTable.set(data);
            const chartData = this.prepareChartDataWithOther(data, 1);
            this.resolvedDataByRegistrar.set(chartData);
        });
        // ENTITY TYPES
        this.statisticsService.getResolvedByEntityTypes(r, y, s, t, b).subscribe((data) => {
            if (!Array.isArray(data) || data.length === 0) {
                this.resolvedDataByEntityTypes.set([]);
                return;
            }
            const keys = data?.map((i: any) => `${i.name}`) || [];

            this.translate.get(keys).subscribe((translations: any) => {
                const translatedData = data.map((i: any) => ({
                    name: translations[i.name] || i.name,
                    // name: i.name,
                    value: i.value,
                    extra: { id: i.name },
                }));
                console.log(translatedData);
                this.resolvedDataByEntityTypes.set(translatedData);
            });
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
        const type = event.extra.id;
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
        console.log('onstateChange', newState);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                state: newState,
            },
            queryParamsHandling: 'merge',
        });
    }
    onBornDigitalChange(newValue: string) {
        console.log('onBornDigitalChange', newValue);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                born: newValue,
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

    downloadCSV(table: string) {
        // 1) filename podle filtrů
        let filename = '';
        if (this.isActive === 'assignments') {
            filename = `assignments-${table}`;
        } else {
            filename = `resolvations-${table}`;
        }
        if (this.selectedYear()) filename += `-${this.selectedYear()}`;
        if (this.selectedRegistrar()) filename += `-${this.selectedRegistrar()}`;
        if (this.selectedState && this.selectedState !== 'all') filename += `-${this.selectedState}`;
        if (this.selectedType()) filename += `-${this.selectedType()}`;
        if (this.selectedBornDigitalState && this.selectedBornDigitalState !== 'all') filename += `-born-${this.selectedBornDigitalState}`;
        filename += `.csv`;

        // 2) vyber zdroj dat
        let data: any[] = [];
        if (this.isActive === 'resolvations') {
            if (table === 'by-registrars') data = this.resolvedDataByRegistrar();
            if (table === 'by-years') data = this.resolvedDataByDate();
        } else {
            if (table === 'by-registrars') data = this.chartDataByRegistrarTable();
            if (table === 'by-years') data = this.chartDataByDate();
            if (table === 'by-entity-types') data = this.chartDataByEntityTypes();
        }

        // 3) ochrana pro prázdná data
        if (!Array.isArray(data) || data.length === 0) {
            // klidně si místo toho dej snackbar/toast
            console.warn('No data to export.');
            this.snackbar.open(this.translate.instant('statistics.no-data-to-export'), undefined, { duration: 3000 });
            return;
        }

        // 4) vytvoř CSV a stáhni
        const csv = this.toCSV(data);
        this.downloadTextFile(csv, filename, 'text/csv;charset=utf-8;');
    }

    /** Převede array objektů na CSV (včetně flatten extra.*) */
    private toCSV(rows: any[]): string {
        const flattened = rows.map((r) => this.flattenObject(r));

        // sjednocení všech klíčů (aby nic nechybělo, i když některé řádky mají extra klíče)
        const headerSet = new Set<string>();
        flattened.forEach((obj) => Object.keys(obj).forEach((k) => headerSet.add(k)));

        // “nejhezčí” pořadí, když existuje:
        const preferredOrder = ['name', 'title', 'value', 'count', 'year', 'registrar', 'state', 'type'];
        const headers = [...preferredOrder.filter((h) => headerSet.has(h)), ...Array.from(headerSet).filter((h) => !preferredOrder.includes(h))];

        const escape = (val: any) => {
            if (val === null || val === undefined) return '';
            const s = String(val);
            // CSV escaping: když obsahuje uvozovku/čárku/newline, obal do "..." a " zdvoj
            const mustQuote = /[",\n\r;]/.test(s); // ; kvůli excelu (někdy)
            const escaped = s.replace(/"/g, '""');
            return mustQuote ? `"${escaped}"` : escaped;
        };

        const lines: string[] = [];
        lines.push(headers.map(escape).join(',')); // hlavička

        for (const row of flattened) {
            lines.push(headers.map((h) => escape(row[h])).join(','));
        }

        // BOM pomůže Excelu s UTF-8 (čj)
        return '\uFEFF' + lines.join('\n');
    }

    /** Zploští objekt: {a:{b:1}} => {"a.b":1}. Hodí se pro extra.id apod. */
    private flattenObject(obj: any, prefix = '', out: Record<string, any> = {}): Record<string, any> {
        if (obj === null || obj === undefined) return out;

        // pokud je to primitivum, uložíme pod prefix (většinou se nepoužije)
        if (typeof obj !== 'object' || obj instanceof Date) {
            if (prefix) out[prefix] = obj instanceof Date ? obj.toISOString() : obj;
            return out;
        }

        // array -> dáme jako JSON string (CSV-friendly)
        if (Array.isArray(obj)) {
            if (prefix) out[prefix] = JSON.stringify(obj);
            return out;
        }

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
                this.flattenObject(value, path, out);
            } else if (Array.isArray(value)) {
                out[path] = JSON.stringify(value);
            } else {
                out[path] = value instanceof Date ? value.toISOString() : value;
            }
        }
        return out;
    }

    private downloadTextFile(content: string, filename: string, mime: string) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
