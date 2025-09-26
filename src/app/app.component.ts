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

    constructor(private envService: EnvironmentService) {}

    ngOnInit() {
        this.logDevInfo();
    }

    logDevInfo(): void {
        const devInfo = {
            useStaticRuntimeConfig: this.envService.get('useStaticRuntimeConfig'),
            devMode: this.envService.get('devMode'),
            environmentCode: this.envService.get('environmentCode'),
            environmentName: this.envService.get('environmentName'),

            czidloApiServiceBaseUrl: this.envService.get('czidloApiServiceBaseUrl'),

            gitCommitHash: this.envService.get('git_commit_hash'),
            gitTag: this.envService.get('git_tag'),
            buildDate: this.envService.get('build_date'),
        };
        console.log('Dev Info:', devInfo);
        if (devInfo.gitCommitHash) {
            console.log('https://github.com/trineracz/czidlo-frontend/commit/' + devInfo.gitCommitHash);
        }
    }
}
