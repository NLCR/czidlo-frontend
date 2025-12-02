import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-edit-password-dialog',
    standalone: false,
    templateUrl: './edit-password-dialog.component.html',
    styleUrl: './edit-password-dialog.component.scss',
})
export class EditPasswordDialogComponent {
    dialogRef = inject(MatDialogRef<EditPasswordDialogComponent>);
    data = inject(MAT_DIALOG_DATA);
    fb = inject(FormBuilder);
    _snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);

    passwordCopied = false;

    userForm: FormGroup = this.fb.group({
        password: [
            this.data.password || '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(30),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}:;,.?\/]).{8,30}$/),
            ],
        ],
    });
    get password() {
        return this.userForm.get('password')!;
    }

    ngOnInit() {
        // pokud není heslo předané zvenku, vygenerujeme ho při startu
        if (!this.data?.password) {
            this.generatePassword();
        }
    }

    copyPassword() {
        const password = this.userForm.get('password')?.value;
        navigator.clipboard.writeText(password).then(() => {
            this._snackBar.open(this.translate.instant('messages.copied-to-clipboard'), 'Close', { duration: 2000 });
        });
        this.passwordCopied = true;
    }

    onConfirm() {
        this.dialogRef.close(this.userForm.value);
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    generatePassword() {
        this.passwordCopied = false;
        const length = 12; // můžeš změnit třeba na 16

        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_-+=[]{}:;,.?/';
        const all = lowercase + uppercase + numbers + special;

        // zajistíme, že se do hesla dostane aspoň 1 z každé skupiny
        let password = '';
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        // doplníme zbytek náhodnými znaky
        for (let i = password.length; i < length; i++) {
            password += all[Math.floor(Math.random() * all.length)];
        }

        // náhodně promícháme pořadí znaků
        password = password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        // vložíme do formuláře
        this.userForm.patchValue({ password });
    }
}
