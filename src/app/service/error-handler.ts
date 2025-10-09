import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (error.message.includes('Nincs jogosultságod')) {
      alert('Nincs jogosultságod ehhez az oldalhoz!');
    } else if (error.message.includes('Bejelentkezés szükséges')) {
      alert('Először jelentkezz be!');
    } else {
      console.error();
    }
  }
}
