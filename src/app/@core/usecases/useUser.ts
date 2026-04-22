import { UserService } from '@core/services';
import { map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '@core/entities';
import { inject } from '@angular/core';

/**
 * The `UseUser` is responsible for fetching users from Supabase.
 */
export class UseUser {
  private readonly _userService: UserService = inject(UserService);

  getAllUsers() {
    return this._userService.find().pipe(map((response) => response.map((user) => plainToInstance(UserEntity, user as UserEntity))));
  }
}
