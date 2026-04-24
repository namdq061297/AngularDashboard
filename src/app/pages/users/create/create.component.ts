import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { countries } from 'countries-list';

import { UserService } from '@core/services';
import { UserStateService } from '@core/services';

@Component({
  selector: 'app-create-user',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  standalone: false,
})
export class CreateUserComponent implements OnInit, OnDestroy {
  readonly defaultAvatarUrl = '/images/placeholder.png';
  readonly countryOptions = Object.values(countries)
    .map((country) => country.name)
    .sort((left, right) => left.localeCompare(right));
  private readonly _fb = inject(FormBuilder);
  private readonly _userService = inject(UserService);
  private readonly _userStateService = inject(UserStateService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toast = inject(HotToastService);

  isEditMode = false;
  editingUserId = '';
  isLoadingUser = false;
  isSubmitting = false;
  avatarPreviewUrl = this.defaultAvatarUrl;
  avatarFileError = '';
  private _avatarUrlSub?: Subscription;

  form = this._fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(50)]],
    last_name: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(10), Validators.pattern(/^\d+$/), phoneStartsWithZeroValidator()]],
    city: ['', [Validators.maxLength(50)]],
    country: ['Vietnam', [Validators.maxLength(50)]],
    avatar_url: [''],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this._avatarUrlSub = this.form.controls.avatar_url.valueChanges.subscribe((value) => {
      this.avatarPreviewUrl = value || this.defaultAvatarUrl;
    });

    const userId = this._route.snapshot.paramMap.get('id');
    if (!userId) {
      return;
    }

    this.isEditMode = true;
    this.editingUserId = userId;
    this._loadUserForEdit(userId);
  }

  ngOnDestroy(): void {
    this._avatarUrlSub?.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = this.form.getRawValue();

    const request$ = this.isEditMode ? this._userService.update(this.editingUserId, payload) : this._userService.create(payload);

    request$.subscribe({
      next: () => {
        this._userStateService.clear();
        this._toast.success(this.isEditMode ? 'User updated successfully!' : 'User created successfully!');
        this._router.navigate(['/users/list']);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this._toast.error(err?.message || (this.isEditMode ? 'Failed to update user.' : 'Failed to create user.'));
      },
    });
  }

  onCancel(): void {
    this._router.navigate(['/users/list']);
  }

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.avatarFileError = 'Please choose an image file.';
      return;
    }

    this.avatarFileError = '';
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        this.avatarFileError = 'Unable to read selected image.';
        return;
      }
      this.avatarPreviewUrl = result;
      this.form.patchValue({ avatar_url: result });
      this.form.controls.avatar_url.markAsDirty();
    };

    reader.onerror = () => {
      this.avatarFileError = 'Unable to read selected image.';
    };

    reader.readAsDataURL(file);
  }

  onAvatarPreviewError(): void {
    this.avatarPreviewUrl = this.defaultAvatarUrl;
  }

  private _loadUserForEdit(userId: string): void {
    this.isLoadingUser = true;

    this._userService.findById(userId).subscribe({
      next: (user) => {
        this.form.patchValue({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          country: user.country || 'Vietnam',
          avatar_url: user.avatar_url || '',
        });
        this.avatarPreviewUrl = user.avatar_url || this.defaultAvatarUrl;
        this.isLoadingUser = false;
      },
      error: (err: Error) => {
        this.isLoadingUser = false;
        this._toast.error(err?.message || 'Unable to load user for editing.');
        this._router.navigate(['/users/list']);
      },
    });
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
