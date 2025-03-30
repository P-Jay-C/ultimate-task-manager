// app-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent {
  sidebarVisible = false;

  toggleSidebar() {
    console.log('Before toggle - sidebarVisible:', this.sidebarVisible);
    this.sidebarVisible = !this.sidebarVisible;
    console.log('After toggle - sidebarVisible:', this.sidebarVisible);
  }

  onSidebarVisibleChange(visible: boolean) {
    this.sidebarVisible = visible;
  }
}
