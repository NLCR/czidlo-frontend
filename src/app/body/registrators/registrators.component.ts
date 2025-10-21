import { Component, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistratorsService } from '../../services/registrators.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-registrators',
    standalone: false,
    templateUrl: './registrators.component.html',
    styleUrl: './registrators.component.scss',
})
export class RegistratorsComponent {
    isActive = 'registrators';
    loadingRegistrators = signal(false);
    loadingArchivers = signal(false);

    loggedIn = computed(() => this.authService.loggedIn());

    registrators = signal<Array<any>>([]);
    archivers = signal<Array<any>>([]);

    isSidebarOpen = signal(false);
    activeRegistrator: any = null;
    activeArchiver: any = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private registratorsService: RegistratorsService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.route.url.subscribe((url) => {
            this.isActive = url[1]?.path || 'registrators';
            // REDIRECT TO REGISTRATORS IF NO SUBPATH
            if (url.length < 2) {
                this.router.navigate(['/registrators', 'registrators']);
            }
            // REGISTRATORS
            if (this.isActive === 'registrators') {
                this.loadingRegistrators.set(true);
                if (this.registratorsService.registrators().length === 0) {
                    console.log('Loading registrators...');
                    this.loadRegistrators();
                } else {
                    this.registrators.set(this.registratorsService.registrators());
                    this.loadingRegistrators.set(false);
                }
            }
            // ARCHIVERS
            else if (this.isActive === 'archivers') {
                this.loadingArchivers.set(true);
                if (this.registratorsService.archivers().length === 0) {
                    console.log('Loading archivers...');
                    this.loadArchivers();
                } else {
                    this.archivers.set(this.registratorsService.archivers());
                    this.loadingArchivers.set(false);
                }
            }
        });
    }

    loadArchivers(): void {
        this.registratorsService.getArchivers().subscribe({
            next: (data) => {
                this.archivers.set(this.registratorsService.archivers());
            },
            error: (error) => {
                console.error('Error loading archivers in component:', error);
                this.loadingArchivers.set(false);
            },
            complete: () => {
                console.log('Archivers loading complete in component');
                this.loadingArchivers.set(false);
            },
        });
    }

    loadRegistrators(): void {
        this.registratorsService.getRegistrators().subscribe({
            next: (data) => {
                this.registrators.set(this.registratorsService.registrators());
            },
            error: (error) => {
                console.error('Error loading registrators in component:', error);
                this.loadingRegistrators.set(false);
            },
            complete: () => {
                console.log('Registrators loading complete in component');
                this.loadingRegistrators.set(false);
            },
        });
    }

    openSidebar(archiver: any): void {
        this.activeArchiver = archiver;
        this.isSidebarOpen.set(true);
    }
    closeSidebar(): void {
        this.router.navigate(['/registrators', this.isActive]);
        this.isSidebarOpen.set(false);
        this.activeArchiver = null;
        this.activeRegistrator = null;
    }
    deleteArchiver(archiver: any): void {
        console.log('Delete archiver:', archiver);
    }
    deleteRegistrator(registrator: any): void {
        console.log('Delete registrator:', registrator);
    }
}
