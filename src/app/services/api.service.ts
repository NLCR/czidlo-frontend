import { Injectable } from '@angular/core';
import { environment as staticEnv } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = staticEnv.czidloApiServiceBaseUrl || 'http://localhost:3000/api'; // Defaultní hodnota
        console.log('API URL:', this.apiUrl);
    }
}
