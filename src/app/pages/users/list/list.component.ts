import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { UserStateService } from '@core/services';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: false,
})
export class ListComponent implements OnInit {
  private readonly _userStateService = inject(UserStateService);
  private readonly _router = inject(Router);
  private readonly _toast = inject(HotToastService);
  private readonly _searchTerm$ = new BehaviorSubject<string>('');
  readonly perPageOptions = [10, 20, 50];

  readonly users$ = this._userStateService.users$;
  readonly filteredUsers$ = combineLatest([this.users$, this._searchTerm$]).pipe(
    map(([users, searchTerm]) => {
      const normalizedTerm = searchTerm.trim().toLowerCase();

      if (!normalizedTerm) {
        return users;
      }

      return users.filter((user) => {
        const searchableValues = [user.fullName, user.email, user.phone].map((value) => String(value ?? '').toLowerCase());

        return searchableValues.some((value) => value.includes(normalizedTerm));
      });
    }),
  );
  readonly isLoading$ = this._userStateService.loading$;
  readonly error$ = this._userStateService.error$;
  readonly page$ = this._userStateService.page$;
  readonly perPage$ = this._userStateService.perPage$;
  readonly total$ = this._userStateService.total$;
  readonly totalPages$ = combineLatest([this.total$, this.perPage$]).pipe(map(([total, perPage]) => Math.max(1, Math.ceil(total / perPage))));
  readonly pagination$ = combineLatest([this.page$, this.perPage$, this.total$, this.totalPages$]).pipe(
    map(([page, perPage, total, totalPages]) => ({
      page,
      perPage,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    })),
  );

  ngOnInit() {
    this._userStateService.loadUsers();
  }

  userClicked() {
    this._toast.show('User clicked');
  }

  addUser(): void {
    this._router.navigate(['/users/create']);
  }

  reloadUsers(): void {
    this._userStateService.loadUsers(true);
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement | null)?.value ?? '';
    this._searchTerm$.next(searchTerm);
  }

  goToPreviousPage(currentPage: number, perPage: number): void {
    if (currentPage <= 1) {
      return;
    }

    this._userStateService.loadUsers(true, currentPage - 1, perPage);
  }

  goToNextPage(currentPage: number, perPage: number, totalPages: number): void {
    if (currentPage >= totalPages) {
      return;
    }

    this._userStateService.loadUsers(true, currentPage + 1, perPage);
  }

  onPerPageChange(event: Event): void {
    const perPage = Number((event.target as HTMLSelectElement | null)?.value ?? this._userStateService.snapshot.perPage);
    this._userStateService.loadUsers(true, 1, perPage);
  }
}
