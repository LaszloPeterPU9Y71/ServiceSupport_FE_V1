import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgClass} from '@angular/common';
import {AuthStateService} from './service/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './app.html',
  standalone: true,
})
export class App {
  protected readonly title = signal('ServiceSupport-FE');

  auth = inject(AuthStateService);

  onLogout() {
    this.auth.logout();
  }


}
