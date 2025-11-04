import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || error.message || 'Ismeretlen hiba';
        this.snackBar.open(`Backend hiba: ${msg}`, 'Bezár', { duration: 5000 });
        return throwError(() => error); // tovább dobjuk, hogy a GlobalErrorHandler is elkapja
      })
    );
  }
}
