import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { marked } from 'marked'; // nainstalujeme níže
import { EnvironmentService } from '../../services/environment.service';

@Component({
    selector: 'app-information',
    standalone: false,
    templateUrl: './information.component.html',
    styleUrl: './information.component.scss',
})
export class InformationComponent {
    isActive: 'info' | 'rules' | 'contact' = 'info';
    markdownText: string = '';
    htmlContent: any = '';
    loggedIn: boolean = true;

    constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiService, private envService: EnvironmentService) { }

    ngOnInit() {
        this.route.url.subscribe((url) => {
            console.log('URL:', url);
            const tab = url[1]?.path;
            if (tab === 'info' || tab === 'rules' || tab === 'contact') {
                this.isActive = tab;
                if (this.isActive === 'info') {
                    this.apiService.getInfo().subscribe((text) => {
                        this.markdownText = text;
                        this.htmlContent = marked.parse(text); // převede markdown → HTML
                    });
                }
                if (this.isActive === 'rules') {
                    this.apiService.getRules().subscribe((text) => {
                        this.markdownText = text;
                        this.htmlContent = marked.parse(text); // převede markdown → HTML
                    });
                }
                if (this.isActive === 'contact') {
                    this.markdownText = 'Pro kontaktujte nás, prosím, použijte email:';
                    this.htmlContent = marked.parse(this.markdownText);
                }
            } else {
                this.router.navigate(['/information', 'info']);
            }
        });
    }

    editInfo(active: any) {
        console.log('Editace:', active);
        if (active === 'info') {
            window.open(this.envService.get('pageEditInfoCzUrl'));
        }
        if (active === 'rules') {
            window.open(this.envService.get('pageEditRulesCzUrl'));
        }
        if (active === 'contact') {
            window.open(this.envService.get('pageEditContactsCzUrl'));
        }
    }
}
