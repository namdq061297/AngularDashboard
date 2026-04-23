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
  page: number;
  perPage: number;
  total: number;
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
    page: 1,
    perPage: 10,
    total: 0,
  });

  readonly state$ = this._stateSubject.asObservable();
  readonly users$ = this.state$.pipe(map((state) => state.users));
  readonly loading$ = this.state$.pipe(map((state) => state.loading));
  readonly error$ = this.state$.pipe(map((state) => state.error));
  readonly page$ = this.state$.pipe(map((state) => state.page));
  readonly perPage$ = this.state$.pipe(map((state) => state.perPage));
  readonly total$ = this.state$.pipe(map((state) => state.total));

  constructor(private readonly _userService: UserService) {}

  get snapshot(): UserState {
    return this._stateSubject.value;
  }

  loadUsers(forceRefresh = false, page = this.snapshot.page, perPage = this.snapshot.perPage): void {
    const currentState = this.snapshot;
    const nextPage = Math.max(1, page);
    const nextPerPage = Math.max(1, perPage);

    if (currentState.loading) {
      return;
    }

    if (currentState.loaded && !forceRefresh && currentState.page === nextPage && currentState.perPage === nextPerPage) {
      return;
    }

    this._patchState({ loading: true, error: null, page: nextPage, perPage: nextPerPage });

    this._userService
      .find({ page: nextPage, perPage: nextPerPage })
      .pipe(
        take(1),
        map((result) => ({
          ...result,
          data: result.data.map((user) => plainToInstance(UserEntity, user)),
        })),
        catchError((error: Error) => {
          this._patchState({
            loading: false,
            error: error.message || 'Unable to load users.',
          });
          return EMPTY;
        }),
      )
      .subscribe((result) => {
        this._patchState({
          users: result.data,
          loading: false,
          loaded: true,
          error: null,
          page: result.page,
          perPage: result.perPage,
          total: result.total,
        });
      });
  }

  clear(): void {
    this._stateSubject.next({
      users: [],
      loading: false,
      loaded: false,
      error: null,
      page: 1,
      perPage: 10,
      total: 0,
    });
  }

  private _patchState(partialState: Partial<UserState>): void {
    this._stateSubject.next({
      ...this.snapshot,
      ...partialState,
    });
  }
}
