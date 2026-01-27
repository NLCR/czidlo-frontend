import { Component } from '@angular/core';
import { EnvironmentService } from './services/environment.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false,
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'czidlo-frontend';

    constructor(private envService: EnvironmentService) { }

    ngOnInit() {
        this.logDevInfo();
    }

    logDevInfo(): void {
        const devInfo = {
            useStaticRuntimeConfig: this.envService.get('useStaticRuntimeConfig'),
            devMode: this.envService.get('devMode'),
            environmentCode: this.envService.get('environmentCode'),
            environmentName: this.envService.get('environmentName'),
            //build info
            gitCommitHash: this.envService.get('git_commit_hash'),
            gitTag: this.envService.get('git_tag'),
            buildDate: this.envService.get('build_date'),
            //apis
            czidloApiServiceBaseUrl: this.envService.get('czidloApiServiceBaseUrl'),
            czidloPublicApiBaseUrl: this.envService.get('czidloPublicApiBaseUrl'),
            //es
            esBaseUrl: this.envService.get('esBaseUrl'),
            esLogin: this.envService.get('esLogin'),
            //esPassword: this.envService.get('esPassword'),
            esIndexSearch: this.envService.get('esIndexSearch'),
            esIndexAssign: this.envService.get('esIndexAssign'),
            esIndexResolve: this.envService.get('esIndexResolve'),
            //info pages
            pageInfoCzUrl: this.envService.get('pageInfoCzUrl'),
            pageRulesCzUrl: this.envService.get('pageRulesCzUrl'),
            pageContactsCzUrl: this.envService.get('pageContactsCzUrl'),

            pageInfoEnUrl: this.envService.get('pageInfoEnUrl'),
            pageRulesEnUrl: this.envService.get('pageRulesEnUrl'),
            pageContactsEnUrl: this.envService.get('pageContactsEnUrl'),
        };
        console.log('Dev Info:', devInfo);
        if (devInfo.gitCommitHash) {
            console.log('https://github.com/trineracz/czidlo-frontend/commit/' + devInfo.gitCommitHash);
        }
    }
}
