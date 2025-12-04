import { Component, computed, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
    selector: 'app-logs',
    standalone: false,
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
    loggedIn = computed(() => this.authService.loggedIn());
    isAdmin = computed(() => this.authService.isAdmin());

    logs: any = null;
    datePickerOpened: boolean = false;
    startDateControl = new FormControl<Date | null>(null, [Validators.required, this.dateValidator]);
    endDateControl = new FormControl<Date | null>(null, [Validators.required, this.dateValidator]);

    constructor(
        private authService: AuthService,
        private apiService: ApiService,
        private dateAdapter: DateAdapter<Date>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: any
    ) {}

    ngOnInit() {
        this.loadLogs();
    }

    loadLogs() {
        if (!this.isAdmin()) {
            console.warn('User is not an administrator. Cannot load users.');
            return;
        }
        this.apiService.getLogs(30).subscribe({
            next: (response) => {
                this.logs = response;
            },
            error: (error) => {
                console.error('Error loading logs:', error);
            },
        });
    }

    onDownloadLogs(period?: string) {
        console.log('Downloading logs...', period);
        let minDate = null;
        let dayAfterMaxDate = null;
        const now = new Date();
        if (period === 'last_month') {
            const dFrom = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
            const dTo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            minDate = dFrom.toISOString().slice(0, 10);
            dayAfterMaxDate = dTo.toISOString().slice(0, 10);
        } else if (period === 'this_month') {
            const dFrom = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            // const dTo = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
            minDate = dFrom.toISOString().slice(0, 10);
            // dayAfterMaxDate = dTo.toISOString().slice(0, 10);
        }
        this.apiService.getLogs(null, minDate, dayAfterMaxDate);
    }
    private formatLocalDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    private addOneDay(date: Date): Date {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
    }

    onDownloadLogsWithDateRange() {
        let dateFrom: string | null = null;
        let dateTo: string | null = null;

        if (this.startDateControl.value) {
            dateFrom = this.formatLocalDate(new Date(this.startDateControl.value));
        }

        if (this.endDateControl.value) {
            dateTo = this.formatLocalDate(this.addOneDay(new Date(this.endDateControl.value)));
        }
        this.apiService.getLogs(null, dateFrom, dateTo);
    }

    openDatePicker() {
        this.datePickerOpened = !this.datePickerOpened;
    }
    dateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            // 1) Material už dal parse error (uživatel píše nesmysl) → neplatné
            //    Např. { text: 'abc' } nebo podobná struktura dle adapteru
            const matParseErr = (control as any).getError?.('matDatepickerParse');
            if (matParseErr) return { invalidDate: true };

            // 2) prázdná hodnota necháme na Validators.required
            if (value === null || value === '') return null;

            // 3) validní je jen skutečný Date s platným časem
            if (value instanceof Date) {
                return isNaN(value.getTime()) ? { invalidDate: true } : null;
            }

            // 4) pokud je to string → zkusíme převést adapterem podle formátu,
            //    a když to není validní Date, označíme za chybu
            if (typeof value === 'string') {
                const parsed = this.dateAdapter.parse(value, this.dateFormats?.parse?.dateInput);
                if (parsed instanceof Date && !isNaN(parsed.getTime())) {
                    return null;
                }
                return { invalidDate: true };
            }

            // 5) cokoliv jiného (např. objekt) je neplatné
            return { invalidDate: true };
        };
    }
}
