import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

    users = ['Ampaco', 'Ascan', 'CHM_NM', 'Digitalizace_NM'];

}
