import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {RegisterUserRequest, RoleService, UserService} from '../api';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-component.html',
})
export class RegisterComponent implements OnInit {

  private userService = inject(UserService);
  private router = inject(Router);
  private roleService = inject(RoleService);

  error = signal<string | null>(null);

  fullName = '';
  phone = '';
  email = '';
  password = '';
  position = '';

  // szerepkörök, amiket a backend küld (pl. ["ROLE_ADMIN", "ROLE_USER"])
  roleSignal = signal<string[]>([]);

  // szerepkörök, amiket kipipáltunk
  selectedRoles: string[] = [];

  ngOnInit() {
    this.roleService.getAllRoles().subscribe({
      next: roles => {
        this.roleSignal.set(roles ?? []);
      },
      error: err => {
        console.error('Szerepkörök lekérése sikertelen', err);
        this.roleSignal.set([]);
      }
    });
  }

  // checkbox pipálás logika
  toggleRole(role: string, checked: boolean) {
    if (checked) {
      // hozzáadjuk ha még nincs benne
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles = [...this.selectedRoles, role];
      }
    } else {
      // kivesszük
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  onRegister() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s()-]+$/; // egyszerű telefonszám validáció

    if (!this.fullName?.trim()) {
      this.error.set('❌ A teljes név megadása kötelező!');
      return;
    }

    if (!this.phone?.trim()) {
      this.error.set('❌ A telefonszám megadása kötelező!');
      return;
    }

    if (!phoneRegex.test(this.phone)) {
      this.error.set('❌ Érvénytelen telefonszám!');
      return;
    }

    if (!this.email?.trim()) {
      this.error.set('❌ Az e-mail cím megadása kötelező!');
      return;
    }

    if (!emailRegex.test(this.email)) {
      this.error.set('❌ Érvénytelen e-mail cím!');
      return;
    }

    if (!this.password?.trim()) {
      this.error.set('❌ A jelszó megadása kötelező!');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('❌ A jelszó legalább 6 karakter hosszú legyen!');
      return;
    }

    if (!this.position?.trim()) {
      this.error.set('❌ A pozíció megadása kötelező!');
      return;
    }

    if (!this.selectedRoles || this.selectedRoles.length === 0) {
      this.error.set('❌ Legalább egy szerepkört ki kell választani!');
      return;
    }

    const newUser: RegisterUserRequest = {
      fullName: this.fullName,
      phoneNumber: this.phone,
      email: this.email,
      password: this.password,
      position: this.position,
      roles: this.selectedRoles, // <-- EZ A LÉNYEG
    };

    this.userService.registerUser(newUser).subscribe({
      next: () => this.router.navigate(['/collagues']),
      error: () => this.error.set('Regisztráció sikertelen'),
    });
  }
}
