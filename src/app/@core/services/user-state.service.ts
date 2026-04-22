import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

import { UserEntity } from '@core/entities';
import { UserService } from './user.service';

export interface UserState {
  users: UserEntity[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly _stateSubject = new BehaviorSubject<UserState>({
    users: [],
    loading: false,
    loaded: false,
    error: null,
  });

  readonly state$ = this._stateSubject.asObservable();
  readonly users$ = this.state$.pipe(map((state) => state.users));
  readonly loading$ = this.state$.pipe(map((state) => state.loading));
  readonly error$ = this.state$.pipe(map((state) => state.error));

  constructor(private readonly _userService: UserService) {}

  get snapshot(): UserState {
    return this._stateSubject.value;
  }

  loadUsers(forceRefresh = false): void {
    const currentState = this.snapshot;

    if (currentState.loading) {
      return;
    }

    if (currentState.loaded && !forceRefresh) {
      return;
    }

    this._patchState({ loading: true, error: null });

    this._userService
      .find()
      .pipe(
        take(1),
        map((users) => users.map((user) => plainToInstance(UserEntity, user))),
        catchError((error: Error) => {
          this._patchState({
            loading: false,
            error: error.message || 'Unable to load users.',
          });
          return EMPTY;
        }),
      )
      .subscribe((users) => {
        this._patchState({
          users,
          loading: false,
          loaded: true,
          error: null,
        });
      });
  }

  clear(): void {
    this._stateSubject.next({
      users: [],
      loading: false,
      loaded: false,
      error: null,
    });
  }

  private _patchState(partialState: Partial<UserState>): void {
    this._stateSubject.next({
      ...this.snapshot,
      ...partialState,
    });
  }
}
