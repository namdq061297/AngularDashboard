import { Component, inject, OnInit } from '@angular/core';
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
  private readonly _toast = inject(HotToastService);
  private readonly _searchTerm$ = new BehaviorSubject<string>('');

  readonly users$ = this._userStateService.users$;
  readonly filteredUsers$ = combineLatest([this.users$, this._searchTerm$]).pipe(
    map(([users, searchTerm]) => {
      const normalizedTerm = searchTerm.trim().toLowerCase();

      if (!normalizedTerm) {
        return users;
      }

      return users.filter((user) => {
        const searchableValues = [user.fullName, user.email, user.phone].map((value) => String(value ?? '').toLowerCase());
        console.log('searchableValues', searchableValues);

        return searchableValues.some((value) => value.includes(normalizedTerm));
      });
    }),
  );
  readonly isLoading$ = this._userStateService.loading$;
  readonly error$ = this._userStateService.error$;

  ngOnInit() {
    this._userStateService.loadUsers();
  }

  userClicked() {
    this._toast.show('User clicked');
  }

  reloadUsers(): void {
    this._userStateService.loadUsers(true);
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement | null)?.value ?? '';
    this._searchTerm$.next(searchTerm);
  }
}
