import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs/operators';
import { HotToastService } from '@ngxpert/hot-toast';

import { AuthenticationService } from '@auth';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthenticationService);
  private readonly _router = inject(Router);
  private readonly _toast = inject(HotToastService);

  isSubmitting = false;

  form = this._fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this._toast.error('Confirm password does not match new password.');
      return;
    }

    if (newPassword === currentPassword) {
      this._toast.error('New password must be different from current password.');
      return;
    }

    this.isSubmitting = true;

    this._authService
      .changePassword(currentPassword, newPassword)
      .pipe(switchMap(() => this._authService.logout()))
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this._toast.success('Password changed successfully. Please login again.');
          this._router.navigate(['/login']);
        },
        error: (error: Error) => {
          this._toast.error(error?.message || 'Unable to change password.');
        },
      });
  }

  onCancel(): void {
    this._router.navigate(['/dashboard']);
  }
}
