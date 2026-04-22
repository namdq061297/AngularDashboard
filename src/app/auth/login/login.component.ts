import { Component } from '@angular/core';

import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthenticationService } from '@app/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  version: string | null = environment.version;
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _authService: AuthenticationService,
    private readonly _toast: HotToastService,
  ) {}

  login() {
    if (!this.email || !this.password) {
      this._toast.error('Email and password are required');
      return;
    }

    this.isLoading = true;

    this._authService
      .login({
        email: this.email,
        password: this.password,
        remember: true,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res) {
            this._toast.success('Login successful');
            this._router.navigate([this._route.snapshot.queryParams['redirect'] || '/dashboard'], { replaceUrl: true });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this._toast.error(error?.message || 'Login failed');
        },
      });
  }
}
