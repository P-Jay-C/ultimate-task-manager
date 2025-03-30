import { Component, Input } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() visible: boolean = false;
}
