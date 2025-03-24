import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, ButtonModule, SidebarModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  sidebarVisible = false;
  isDarkMode = true; // Start in dark mode
  menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => console.log('Profile clicked') },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => console.log('Logout clicked') },
  ];

  constructor() {
    // Apply dark mode by default
    document.documentElement.classList.add('dark');
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');
  }

}
