import { Component, signal, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from '../../dialogs/edit-user/edit-user.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-users',
    standalone: false,
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent {
    loggedIn = computed(() => this.authService.loggedIn());

    users = signal<Array<any>>([]);
    activeUser: any = null;

    isSidebarOpen = signal<boolean>(false);

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.route.url.subscribe((url) => {
            console.log('Route URL changed:', url);
            if (url.length === 2) {
                const userId = url[1].path;
                this.loadUserDetails(userId);
            }
        });
    }

    loadUsers() {
        console.log('Loading users...');
        this.usersService.getUsers().subscribe({
            next: (response) => {
                this.users.set(this.usersService.users());
            },
            error: (error) => {
                console.error('Error loading users:', error);
            },
        });
    }

    loadUserDetails(userId: string) {
        this.usersService.getUser(userId).subscribe({
            next: (response) => {
                this.activeUser = response;
                this.isSidebarOpen.set(true);
            },
            error: (error) => {
                console.error('Error loading user details:', error);
            },
        });
    }

    openSidebar(user: any) {
        this.router.navigate(['/users', user.id]);
    }
    closeSidebar() {
        this.router.navigate(['/users']);
    }
    openAddUserDialog() {
        this.dialog.open(EditUserComponent, {
            data: {
                login: '',
                email: '',
                isAdmin: false,
                password: ''
            },
            maxWidth: '800px',
            minWidth: '600px',
        }).afterClosed().subscribe((result) => {
            console.log('Add User dialog closed:', result);
            if (result) {
                this.usersService.addUser(result).subscribe({
                    next: (response) => {
                        console.log('User added successfully:', response);
                        this.loadUsers();
                    },
                    error: (error) => {
                        console.error('Error adding user:', error);
                    },
                });
            }
        });
    }
}
