import { Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
})
export class MenuComponent {
    isLangDropdownOpen = signal(false);
    currentLang = 'cs';
    loggedIn = signal(true);
    user = 'Pavla';
    atTop = true;
    atBottom = false;

    constructor(private translate: TranslateService) {
        // this.currentLang = this.translate.getCurrentLang() || 'cs';
        this.currentLang = 'en';
    }

    ngOnInit() {
        const savedLang = localStorage.getItem('lang');
        console.log('savedLang', savedLang);
        if (savedLang) {
            this.currentLang = savedLang;
        }
    }

    toggleLangDropdown() {
        this.isLangDropdownOpen.set(!this.isLangDropdownOpen());
    }
    changeLanguage(lang: string) {
        console.log('changeLanguage', lang);
        this.translate.use(lang);
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.toggleLangDropdown();
        console.log(this.isLangDropdownOpen());
    }
    onLoginClick() {
        this.loggedIn.set(true);
    }
    onLogoutClick() {
        this.loggedIn.set(false);
    }
    onScroll(menu: HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        this.atTop = scrollTop === 0;
        this.atBottom = scrollTop + clientHeight >= scrollHeight;
    }
}
