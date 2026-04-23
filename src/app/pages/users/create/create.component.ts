import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

import { UserService } from '@core/services';
import { UserStateService } from '@core/services';

@Component({
  selector: 'app-create-user',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  standalone: false,
})
export class CreateUserComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _userService = inject(UserService);
  private readonly _userStateService = inject(UserStateService);
  private readonly _router = inject(Router);
  private readonly _toast = inject(HotToastService);

  isSubmitting = false;

  form = this._fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(50)]],
    last_name: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(10), Validators.pattern(/^\d+$/), phoneStartsWithZeroValidator()]],
    city: ['', [Validators.maxLength(50)]],
    country: ['', [Validators.maxLength(50)]],
    avatar_url: ['', [Validators.maxLength(500)]],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = this.form.getRawValue();

    this._userService.create(payload).subscribe({
      next: () => {
        this._userStateService.clear();
        this._toast.success('User created successfully!');
        this._router.navigate(['/users/list']);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this._toast.error(err?.message || 'Failed to create user.');
      },
    });
  }

  onCancel(): void {
    this._router.navigate(['/users/list']);
  }
}

function phoneStartsWithZeroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    return value.startsWith('0') ? null : { startsWithZero: true };
  };
}
