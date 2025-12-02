import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-edit-registrar-dialog',
    standalone: false,
    templateUrl: './edit-registrar-dialog.component.html',
    styleUrl: './edit-registrar-dialog.component.scss',
})
export class EditRegistrarDialogComponent {
    dialogRef = inject(MatDialogRef<EditRegistrarDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    name: string = '';
    code: string = '';
    description: string = '';
    resolverMode: boolean = false;
    reservationMode: boolean = false;
    registrarMode: boolean = false;
    hidden: boolean = false;

    ngOnInit(): void {
        this.name = this.data.name || '';
        this.code = this.data.code || '';
        this.description = this.data.description || '';
        this.resolverMode = this.data.resolverMode || false;
        this.reservationMode = this.data.reserveMode || false;
        this.registrarMode = this.data.registrarMode || false;
        this.hidden = this.data.hidden || false;
    }
    toggleResolverMode(): void {
        this.resolverMode = !this.resolverMode;
    }
    toggleReservationMode(): void {
        this.reservationMode = !this.reservationMode;
    }
    toggleRegistrarMode(): void {
        this.registrarMode = !this.registrarMode;
    }
    toggleHidden(): void {
        this.hidden = !this.hidden;
    }
    onConfirm(): void {
        this.dialogRef.close({
            name: this.name,
            code: this.code,
            description: this.description,
            allowedRegistrationModeByResolver: this.resolverMode,
            allowedRegistrationModeByReservation: this.reservationMode,
            allowedRegistrationModeByRegistrar: this.registrarMode,
            hidden: this.hidden,
        });
    }
    onCancel(): void {
        this.dialogRef.close(false);
    }
}
