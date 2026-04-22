export class UserEntity {
  id = '';
  first_name = '';
  last_name = '';
  email = '';
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;

  get fullName(): string {
    const fullName = `${this.first_name || ''} ${this.last_name || ''}`.trim();
    return fullName || this.email || 'Unknown user';
  }

  get displayLocation(): string {
    const city = this.city || '';
    const country = this.country || '';
    return [city, country].filter(Boolean).join(', ') || '-';
  }

  get avatarThumbnail(): string {
    return this.avatar_url || 'https://via.placeholder.com/50';
  }
}
