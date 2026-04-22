import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { NavMode, ShellService } from '@app/shell/services/shell.service';
import { webSidebarMenuItems } from '@core/constants';
import { CredentialsService } from '@auth';
import { NavMenuItem } from '@core/interfaces';
import { SupabaseService } from '@core/services';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent implements OnInit {
  version: string = environment.version;
  year: number = new Date().getFullYear();
  sidebarItems: NavMenuItem[] = [];
  sidebarExtendedItem = -1;
  navExpanded = true;
  userEmail = 'user';

  constructor(
    private readonly _router: Router,
    private readonly _credentialsService: CredentialsService,
    private readonly _supabaseService: SupabaseService,
    public shellService: ShellService,
  ) {
    this.sidebarItems = webSidebarMenuItems;
  }

  ngOnInit(): void {
    void this._setLoggedInUserLabel();
    this.shellService.activeNavTab(this.sidebarItems, this.sidebarExtendedItem);

    this._router.events
      .pipe(untilDestroyed(this))
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.shellService.activeNavTab(this.sidebarItems, this.sidebarExtendedItem);
      });

    this.shellService.navMode$.pipe(untilDestroyed(this)).subscribe((mode) => {
      /**
       * Change the second condition to mode === NavMode.Locked to make navbar by default collapsed
       */
      this.navExpanded = mode === NavMode.Free;
    });
  }

  toggleSidebar(isEnterEvent: boolean): void {
    this.shellService.navMode$.pipe(untilDestroyed(this)).subscribe((mode) => {
      if (isEnterEvent) {
        this.navExpanded = true;
      } else if (!isEnterEvent && mode === NavMode.Free) {
        this.navExpanded = false;
      }
    });
  }

  activateSidebarItem(index: number): void {
    const item = this.sidebarItems[index];
    if (item.disabled) return;

    if (index !== this.sidebarExtendedItem) {
      this.sidebarExtendedItem = index;
    } else {
      this.sidebarExtendedItem = -1; // Toggle the same item
    }

    this.shellService.activateNavItem(index, this.sidebarItems);
  }

  activateSidebarSubItem(index: number, subItem: NavMenuItem): void {
    this.shellService.activateNavSubItem(index, subItem, this.sidebarItems);
  }

  private async _setLoggedInUserLabel(): Promise<void> {
    const emailFromCredentials = this._credentialsService.credentials?.email;
    const usernameFromCredentials = this._credentialsService.credentials?.username;
    const preferredName = emailFromCredentials || usernameFromCredentials;

    if (preferredName) {
      this.userEmail = preferredName.split('@')[0] || 'user';
      return;
    }

    if (!this._supabaseService.isConfigured) {
      return;
    }

    const response = await this._supabaseService.client.auth.getUser();
    const supabaseEmail = response.data.user?.email;

    if (supabaseEmail) {
      this.userEmail = supabaseEmail.split('@')[0] || 'user';
    }
  }

  logout(): void {
    this._credentialsService.setCredentials();
    this._router.navigate(['/login']);
  }
}
