import { env } from './.env';

export const environment = {
  production: false,
  version: env['npm_package_version'] + '-dev',
  defaultLanguage: 'de-DE',
  supportedLanguages: ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT'],
  supabase: {
    url: env['NG_APP_SUPABASE_URL'] || '',
    anonKey: env['NG_APP_SUPABASE_ANON_KEY'] || '',
    usersTable: env['NG_APP_SUPABASE_USERS_TABLE'] || 'users',
  },
};
