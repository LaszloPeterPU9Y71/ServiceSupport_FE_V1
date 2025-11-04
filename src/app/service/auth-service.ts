import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from '../api';
import { jwtDecode } from 'jwt-decode';

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
  login(username: string, password: string) {
    const request: LoginRequest = { email: username, password };
    this.authApi.login(request).subscribe({
      next: (res: LoginResponse) => {
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

        if (this.userId()) {
          localStorage.setItem(this.POSITION_KEY, this.position()!.toString());

        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        this.clearAuth();
        return err;
      }
    });
    return undefined;
  }

  // ---- Logout ----
  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  // ---- Helpers ----
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
