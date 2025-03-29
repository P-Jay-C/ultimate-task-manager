import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, ButtonModule,NgIf],
  providers: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [];
  username: string | null = null;
  private authSubscription: Subscription;

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {
    this.authSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.username = user ? user.username : null;
      this.updateMenuItems();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  private updateMenuItems(): void {
    if (this.authService.isAuthenticated()) {
      this.menuItems = [
        { label: 'Profile', icon: 'pi pi-user', command: () => console.log('Profile clicked') },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: () => {
            this.confirmLogout();
          },
        },
      ];
    } else {
      this.menuItems = [
        { label: 'Login', icon: 'pi pi-sign-in', command: () => console.log('Login clicked') },
        { label: 'Register', icon: 'pi pi-user-plus', command: () => console.log('Register clicked') },
      ];
    }
  }

  private confirmLogout(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService.logout();
        console.log('Logout confirmed');
      },
      reject: () => {
        console.log('Logout cancelled');
      },
    });
  }
}
