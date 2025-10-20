import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login-dialog',
    standalone: false,
    templateUrl: './login-dialog.component.html',
    styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
    dialogRef = inject(MatDialogRef<LoginDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    username: string = '';
    password: string = '';
    showPassword: boolean = false;

    errorMessage: string = '';

    constructor(private authService: AuthService) {}

    onConfirm(): void {
        if (this.username && this.password) {
            this.authService.login(this.username, this.password).subscribe({
                next: (response) => {
                    console.log('Login successful', response);
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    console.error('Login failed', error);
                    this.errorMessage = 'users.login.error';
                }
                });
            }
    }
    onCancel(): void {
        // Close the dialog, return false
        this.dialogRef.close(false);
    }
}
