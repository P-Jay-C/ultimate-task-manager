import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode: boolean;

  constructor() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : true;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
  }
}
