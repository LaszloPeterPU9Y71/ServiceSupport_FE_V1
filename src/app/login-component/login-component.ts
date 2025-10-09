import {Component, inject, signal} from '@angular/core';
import { AuthStateService } from '../service/auth-service';
import {FormsModule} from '@angular/forms';

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

  error = signal<string | null>(null);


  username = '';
  password = '';

  onLogin() {
    this.auth.login(this.username, this.password);
  }
}
