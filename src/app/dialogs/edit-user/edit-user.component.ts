import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-edit-user',
    standalone: false,
    templateUrl: './edit-user.component.html',
    styleUrl: './edit-user.component.scss',
})
export class EditUserComponent {
    dialogRef = inject(MatDialogRef<EditUserComponent>);
    data = inject(MAT_DIALOG_DATA);

    username: string = '';
    password: string = '';
    email: string = '';
    admin: boolean = false;

    ngOnInit(): void {
        this.username = this.data.username || '';
        this.password = this.data.password || '';
        this.email = this.data.email || '';
        this.admin = this.data.admin || false;
    }

    onConfirm(): void {
        this.dialogRef.close({
            login: this.username,
            password: this.password,
            email: this.email,
            isAdmin: this.admin,
        });
    }

    onCancel(): void {
        // Close the dialog, return false
        this.dialogRef.close(false);
    }

    toggleIsAdmin(): void {
        this.admin = !this.admin;
    }
}
