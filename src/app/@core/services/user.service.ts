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

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _supabaseService: SupabaseService) {}

  findById(userId: string) {
    return defer(async (): Promise<UserEntity> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured. Set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY.');
      }

      const { data, error } = await this._supabaseService.client.from(environment.supabase.usersTable).select('*').eq('id', userId).limit(1);

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error('User not found.');
      }

      return data[0] as UserEntity;
    });
  }

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

  create(payload: CreateUserPayload) {
    return defer(async (): Promise<UserEntity> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const { data, error } = await this._supabaseService.client.from(environment.supabase.usersTable).insert([payload]).select().limit(1);

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error('Create failed: no row returned. Check RLS select policy for users table.');
      }

      return data[0] as UserEntity;
    });
  }

  update(userId: string, payload: CreateUserPayload) {
    return defer(async (): Promise<UserEntity> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const { data, error } = await this._supabaseService.client.from(environment.supabase.usersTable).update(payload).eq('id', userId).select().limit(1);

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error('Update failed: no row returned. Check RLS update/select policy for users table.');
      }

      return data[0] as UserEntity;
    });
  }

  delete(userId: string) {
    return defer(async (): Promise<string> => {
      if (!this._supabaseService.isConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const { data, error } = await this._supabaseService.client.from(environment.supabase.usersTable).delete().eq('id', userId).select('id');

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error('Delete failed: user was not removed. Check RLS delete policy for users table.');
      }

      return data[0].id as string;
    });
  }
}
