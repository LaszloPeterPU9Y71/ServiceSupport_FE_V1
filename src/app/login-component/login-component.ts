import { Component, inject, signal } from '@angular/core';
import { AuthStateService } from '../service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  templateUrl: './login-component.html',
  imports: [
    FormsModule,
  ],
})
export class LoginComponent {
  private auth = inject(AuthStateService);
  private router = inject(Router);

  error = signal<string | null>(null);

  username = '';
  password = '';

  onLogin() {
    this.auth.login({ email: this.username, password: this.password }).subscribe({
      next: (response: any) => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.error.set("Hibás e-mailcím vagy jelszó");
      }
    });
  }
}
