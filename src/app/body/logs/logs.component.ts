import { Component, computed, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-logs',
    standalone: false,
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
    loggedIn = computed(() => this.authService.loggedIn());

    logs: any = null;

    constructor(private authService: AuthService, private apiService: ApiService) {}

    ngOnInit() {
        console.log('LogsComponent initialized');
        this.loadLogs();
    }

    loadLogs() {
        console.log('Loading logs...');
        this.apiService.getLogs(30).subscribe({
            next: (response) => {
                this.logs = response;
            },
            error: (error) => {
                console.error('Error loading logs:', error);
            }
        });
    }

    onDownloadLogs() {
        console.log('Downloading logs...');
        this.apiService.getLogs();
    }
}
