import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-public-nav-bar',
  standalone: true,
  imports: [ButtonModule,RouterLink,NgClass],
  templateUrl: './public-nav-bar.component.html',
  styleUrl: './public-nav-bar.component.css',
})
export class PublicNavBarComponent {
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
