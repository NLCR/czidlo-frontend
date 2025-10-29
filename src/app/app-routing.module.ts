import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyComponent } from './body/body.component';
import { InformationComponent } from './body/information/information.component';
import { RegistratorsComponent } from './body/registrators/registrators.component';
import { RulesComponent } from './body/rules/rules.component';
import { SearchComponent } from './body/search/search.component';
import { StatisticsComponent } from './body/statistics/statistics.component';
import { ImportRecordComponent } from './body/import-record/import-record.component';
import { ProcessesComponent } from './body/processes/processes.component';
import { LogsComponent } from './body/logs/logs.component';
import { UsersComponent } from './body/users/users.component';

const routes: Routes = [
    { path: '', component: BodyComponent },
    { path: 'information', component: InformationComponent },
    { path: 'information/:tab', component: InformationComponent },
    { path: 'registrators', component: RegistratorsComponent },
    { path: 'registrators/:tab', component: RegistratorsComponent },
    { path: 'registrators/:tab/:id', component: RegistratorsComponent },
    { path: 'rules', component: RulesComponent },
    { path: 'search', component: SearchComponent },
    { path: 'statistics', component: StatisticsComponent },
    { path: 'import', component: ImportRecordComponent },
    { path: 'users', component: UsersComponent },
    { path: 'users/:id', component: UsersComponent },
    { path: 'processes', component: ProcessesComponent },
    { path: 'processes/:tab', component: ProcessesComponent },
    { path: 'processes/:tab/:id', component: ProcessesComponent },
    { path: 'processes/:tab/:id/:action', component: ProcessesComponent },
    { path: 'logs', component: LogsComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
