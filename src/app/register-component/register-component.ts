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
  private roleService = inject(RoleService)


  error = signal<string | null>(null);

  fullName = '';
  phone = '';
  email = '';
  password = '';
  position = '';
  roles = signal<string[]>([]);
  roleSignal = signal<string[]>([]);
  selectedRole = signal<string>('')


  ngOnInit() {
    this.roleService.getAllRoles().subscribe(roles => {
      this.roleSignal.set(roles);
    })
  }

  addRole(): void {
    console.log(this.selectedRole);
    const role = this.selectedRole();
    if (role && !this.roles().includes(role)) {
      this.roles.update(list => [...list, role]);
    }
  }

  removeRole(role: string): void {
    this.roles.update(list => list.filter(r => r !== role));
  }


  onRegister() {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error.set('Érvénytelen e-mail cím!');
      return;
    }

    if (!this.fullName || !this.phone || !this.email || !this.password || !this.position) {
      this.error.set('Minden mezőt ki kell tölteni!');
      return; // kilépés, nem megy tovább a regisztráció
    }


    const newUser: RegisterUserRequest = {
      fullName: this.fullName,
      phoneNumber: this.phone,
      email: this.email,
      password: this.password,
      position: this.position,

    };



    this.userService.registerUser(newUser).subscribe({
      next: () => this.router.navigate(['/collagues']),
      error: () => this.error.set('Regisztráció sikertelen')
    });
  }
}
