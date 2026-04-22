import { Injectable } from '@angular/core';
import { defer, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { CredentialsService } from '@app/auth';
import { Credentials } from '@core/entities';
import { SupabaseService } from '@core/services';

export interface LoginContext {
  email: string;
  password: string;
  remember?: boolean;
  isMobile?: boolean;
}

/**
 * Provides authentication workflow using Supabase Auth.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private readonly _credentialsService: CredentialsService,
    private readonly _supabaseService: SupabaseService,
  ) {}

  /**
   * Authenticates the user via Supabase.
   * @param context The login parameters (email and password).
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    return defer(() =>
      this._supabaseService.client.auth.signInWithPassword({
        email: context.email,
        password: context.password,
      }),
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }

        const { data } = response;
        const user = data.user || {};
        const session = data.session || {};

        const credentials = new Credentials({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          token: session.access_token || '',
          refreshToken: session.refresh_token || '',
          expiresIn: session.expires_in || 3600,
          roles: user.user_metadata?.roles || ['user'],
        });

        this._credentialsService.setCredentials(credentials, context.remember);

        return credentials;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Logs out the user and clear credentials via Supabase.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<any> {
    return defer(() => this._supabaseService.client.auth.signOut()).pipe(
      map(() => {
        this._credentialsService.setCredentials();
        return true;
      }),
      catchError((error) => {
        console.error('Logout error:', error);
        this._credentialsService.setCredentials();
        return throwError(() => error);
      }),
    );
  }
}
