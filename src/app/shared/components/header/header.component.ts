import { Component, EventEmitter, Output } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>(); // Emit event to toggle sidebar

  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => console.log('Profile clicked') },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => console.log('Logout clicked') },
  ];

  constructor(public themeService: ThemeService) {}

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
