import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ForgotPasswordRequest, UserService} from '../api';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password-component.html',

})
export class ResetPasswordComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  email = signal<string>('');
  token = signal<string>('');
  newPassword = signal<string>('');

  message = signal<string | null>(null);
  error = signal<string | null>(null);

  // 🔹 Token igénylése email alapján
  requestToken(): void {
    const req: ForgotPasswordRequest = { email: this.email() };

    this.userService.forgotPassword(req).subscribe({
      next: () => {
        this.message.set('📧 Elküldtük a visszaállító tokent a ' + this.email() + ' címre');
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Nem sikerült elküldeni a tokent.');
        this.message.set(null);
      }
    });
  }

  // 🔹 Jelszó visszaállítása
  resetPassword(): void {
    const req = {
      email: this.email(),
      token: this.token(),
      newPassword: this.newPassword()
    };

    this.userService.changePasswordWithToken(req).subscribe({
      next: () => {
        this.message.set('✅ Jelszó sikeresen megváltoztatva!');
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Nem sikerült megváltoztatni a jelszót.');
        this.message.set(null);
      }
    });
  }
}
