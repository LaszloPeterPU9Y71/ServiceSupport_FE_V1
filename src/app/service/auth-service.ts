import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from '../api';
import { jwtDecode } from 'jwt-decode';
import {Observable, tap} from 'rxjs';

interface DecodedToken {
  sub: string;        // username / email
  fullName: string;        // username / email
  exp: number;        // token lejárati idő
  userId?: number;    // ha a backend belerakja az ID-t
  roles?: string[];   // jogosultságok
  position: string;   // beosztás
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'fullName';
  private readonly USERID_KEY = 'userId';
  private readonly POSITION_KEY = 'position';

  private authApi = inject(AuthService);
  private router = inject(Router);




  // ---- Signals ----
  isLoggedIn = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  roles = signal<string[]>([]);
  username = signal<string | null>(localStorage.getItem(this.USERNAME_KEY));
  position = signal<string | null>(localStorage.getItem(this.USERNAME_KEY));
  userId = signal<number | null>(
    localStorage.getItem(this.USERID_KEY)
      ? +localStorage.getItem(this.USERID_KEY)!
      : null
  );


  private restoreAuthFromStorage() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        this.roles.set(decoded.roles ?? []);
        this.username.set(decoded.fullName ?? null);
        this.userId.set(decoded.userId ?? null);
        this.position.set(decoded.position ?? null);
      } catch (e) {
        console.error(e);
        this.clearAuth();
      }
    }
  }

  constructor() {
    this.restoreAuthFromStorage();
  }


  // ---- Login ----
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(request).pipe(
      tap((res: LoginResponse) => {
        const token = res.token!;
        localStorage.setItem(this.TOKEN_KEY, token);
        this.isLoggedIn.set(true);

        const decoded = jwtDecode<DecodedToken>(token);
        this.roles.set(decoded.roles ?? []);
        this.username.set(decoded.fullName ?? null);
        this.userId.set(decoded.userId ?? null);
        this.position.set(decoded.position ?? null);

        if (this.username()) {
          localStorage.setItem(this.USERNAME_KEY, this.username()!);
        }
        if (this.userId()) {
          localStorage.setItem(this.USERID_KEY, this.userId()!.toString());
        }
        if (this.position()) {
          localStorage.setItem(this.POSITION_KEY, this.position()!.toString());
        }

      })
    );
  }

  // ---- Logout ----
  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  private clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.USERID_KEY);
    localStorage.removeItem(this.POSITION_KEY);

    this.isLoggedIn.set(false);
    this.roles.set([]);
    this.username.set(null);
    this.userId.set(null);
    this.position.set(null);
  }

  canDeleteComment(commentUserId: number): boolean {
    // admin bármit törölhet
    if (this.hasRole('ROLE_ADMIN')) {
      return true;
    }
    // egyébként csak a saját kommentet
    return this.userId() === commentUserId;
  }

}
