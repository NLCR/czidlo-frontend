import { Component, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { marked } from 'marked'; // nainstalujeme níže
import { EnvironmentService } from '../../services/environment.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

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
    loggedIn = signal(false);
    isLoggedIn = computed(() => this.authService.loggedIn());

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private envService: EnvironmentService,
        private authService: AuthService,
        private languageService: LanguageService
    ) {
        // 🔥 Sleduj změnu jazyka → znovu načti obsah
        effect(() => {
            const lang = this.languageService.currentLang();
            console.log('🔄 Language changed → reloading info page', lang);
            this.loadActiveContent(); // znovu načteme data podle isActive
        });
    }

    ngOnInit() {
        this.route.url.subscribe((url) => {
            const tab = url[1]?.path;
            if (tab === 'info' || tab === 'rules' || tab === 'contact') {
                this.isActive = tab;
                this.loadActiveContent();
            } else {
                this.router.navigate(['/information', 'info']);
            }
        });
    }

    private loadActiveContent() {
        if (this.isActive === 'info') {
            this.apiService.getInfo().subscribe((text) => this.renderMarkdown(text));
        } else if (this.isActive === 'rules') {
            this.apiService.getRules().subscribe((text) => this.renderMarkdown(text));
        } else if (this.isActive === 'contact') {
            this.apiService.getContact().subscribe((text) => this.renderMarkdown(text));
        }
    }

    private renderMarkdown(text: string) {
        this.markdownText = text;
        this.htmlContent = marked.parse(text);
    }

    editInfo(active: 'info' | 'rules' | 'contact') {
        const lang = this.languageService.currentLang();

        // Sestav URL podle aktuálního jazyka a typu stránky
        let editUrl = '';

        if (active === 'info') {
            editUrl = lang === 'cs' ? this.envService.get('pageEditInfoCzUrl') : this.envService.get('pageEditInfoEnUrl');
        } else if (active === 'rules') {
            editUrl = lang === 'cs' ? this.envService.get('pageEditRulesCzUrl') : this.envService.get('pageEditRulesEnUrl');
        } else if (active === 'contact') {
            editUrl = lang === 'cs' ? this.envService.get('pageEditContactsCzUrl') : this.envService.get('pageEditContactsEnUrl');
        }

        if (editUrl) {
            console.log(`📝 Otevírám editaci (${lang}):`, editUrl);
            window.open(editUrl, '_blank');
        } else {
            console.warn('⚠️ Edit URL nenalezena pro', active, lang);
        }
    }
}
