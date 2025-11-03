import { Injectable, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    // Signal s aktuálním jazykem
    currentLang = signal(localStorage.getItem('lang') || 'cs');

    constructor(private translate: TranslateService) {
        // Nastav výchozí jazyk
        this.translate.use(this.currentLang());

        // Reaguj na změny zvenku (např. jiný Translate.use)
        this.translate.onLangChange.subscribe((event) => {
            if (event.lang !== this.currentLang()) {
                this.currentLang.set(event.lang);
            }
        });

        // Reaguj na změnu signálu → aktualizuj ngx-translate a localStorage
        effect(() => {
            const lang = this.currentLang();
            this.translate.use(lang);
            localStorage.setItem('lang', lang);
        });
    }

    changeLanguage(lang: string) {
        this.currentLang.set(lang);
    }
}
