import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '@env/environment';
import { Logger } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly _logger = new Logger('SupabaseService');
  private readonly _client: SupabaseClient | null;

  constructor() {
    const { url, anonKey } = environment.supabase;

    if (!url || !anonKey) {
      this._logger.warn('Supabase is not configured. Set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY.');
      this._client = null;
      return;
    }

    this._client = createClient(url, anonKey);
  }

  get client(): SupabaseClient {
    if (!this._client) {
      throw new Error('Supabase is not configured. Please set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY.');
    }

    return this._client;
  }

  get isConfigured(): boolean {
    return Boolean(this._client);
  }
}
