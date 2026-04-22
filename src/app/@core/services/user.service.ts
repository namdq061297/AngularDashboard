import { Injectable } from '@angular/core';
import { defer } from 'rxjs';

import { environment } from '@env/environment';
import { SupabaseService } from './misc';
import { UserEntity } from '@core/entities';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _supabaseService: SupabaseService) {}

  find() {
    return defer(async (): Promise<UserEntity[]> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured. Set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY.');
      }

      const { data, error } = await this._supabaseService.client.from(environment.supabase.usersTable).select('*').order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as UserEntity[];
    });
  }
}
