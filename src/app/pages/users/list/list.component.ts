import { Component, inject, OnInit } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { UserStateService } from '@core/services';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: false,
})
export class ListComponent implements OnInit {
  private readonly _userStateService = inject(UserStateService);
  private readonly _toast = inject(HotToastService);

  readonly users$ = this._userStateService.users$;
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
}
