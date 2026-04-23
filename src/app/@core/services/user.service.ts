import { Injectable } from '@angular/core';
import { defer } from 'rxjs';

import { environment } from '@env/environment';
import { SupabaseService } from './misc';
import { UserEntity } from '@core/entities';

export interface UserQueryParams {
  page: number;
  perPage: number;
}

export interface PaginatedUsersResult {
  data: UserEntity[];
  page: number;
  perPage: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _supabaseService: SupabaseService) {}

  find(params: UserQueryParams) {
    return defer(async (): Promise<PaginatedUsersResult> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured. Set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY.');
      }

      const page = Math.max(1, params.page);
      const perPage = Math.max(1, params.perPage);
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error, count } = await this._supabaseService.client.from(environment.supabase.usersTable).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: (data || []) as UserEntity[],
        page,
        perPage,
        total: count ?? 0,
      };
    });
  }
}
