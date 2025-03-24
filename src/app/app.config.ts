// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { routes } from './app.routes';

// Customize Aura for a black theme
const BlackAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f5f5f5',  // Light gray for contrast
      100: '#e5e5e5',
      200: '#cccccc',
      300: '#b3b3b3',
      400: '#999999',
      500: '#808080',  // Mid-gray as base
      600: '#666666',
      700: '#4d4d4d',
      800: '#333333',
      900: '#1a1a1a',
      950: '#0d0d0d'  // Deep black
    },
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: BlackAura,
        options: { darkModeSelector: '.dark' } // Sync with Tailwind dark mode
      }
    })
  ]
};
