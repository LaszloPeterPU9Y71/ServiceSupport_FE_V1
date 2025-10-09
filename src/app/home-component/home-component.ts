import { Component, inject } from '@angular/core';
import { AuthStateService } from '../service/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h3>Bejelentkezve: {{ auth.username()}}</h3>
    <h5>Beosztás: {{auth.position()}}</h5>
    <h6>Jogosultság: </h6>
    <ul>
      @for (role of auth.roles(); track $index) {
        <li>{{ role }}</li>
      }
    </ul>

    <button (click)="onLogout()">Kijelentkezés</button>
  `
})
export class HomeComponent {
  auth = inject(AuthStateService);

  onLogout() {
    this.auth.logout();
  }
}
