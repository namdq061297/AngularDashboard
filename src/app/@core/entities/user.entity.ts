export class UserEntity {
  id = '';
  first_name = '';
  last_name = '';
  email = '';
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  created_at?: string;

  get displayCreatedAt(): string {
    if (!this.created_at) {
      return '-';
    }
    return new Date(this.created_at).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

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
