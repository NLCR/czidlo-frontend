import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-processes',
  standalone: false,
  templateUrl: './processes.component.html',
  styleUrl: './processes.component.scss'
})
export class ProcessesComponent {

    processes: any[] = [];

    constructor(private apiService: ApiService) {}

    ngOnInit() {
        this.loadProcesses();
    }
    loadProcesses() {
        this.apiService.getProcesses().subscribe({
            next: (data) => {
                this.processes = data;
                console.log('Processes loaded:', this.processes);
            },
            error: (error) => {
                console.error('Error loading processes:', error);
            }
        });
    }

}
