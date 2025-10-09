import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideApi} from './api';   // 👈 generált OpenAPI modul

import {routes} from './app.routes';
import {GlobalErrorHandler} from './service/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(routes),

    // 🔹 kell a HttpClient
    provideHttpClient(),

    // 🔹 kell az OpenAPI provider
    provideApi({
      basePath: 'http://localhost:8080',
      accessToken: localStorage.getItem('auth_token') ?? undefined
    }),

  ]
};
