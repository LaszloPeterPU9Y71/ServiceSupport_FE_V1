import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {User, UserService} from '../api';
import {HomeComponent} from '../home-component/home-component';

@Component({
  selector: 'app-collagues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collagues-component.html'
})
export class CollaguesComponent implements OnInit {
  private userService = inject(UserService);


  // --- Signals ---
  users = signal<User[]>([]);
  newRole = signal<Record<number, string | null>>({});
  loading = signal(false);
  error = signal<string | null>(null);


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Hiba a userek betöltésekor:', err);
        this.error.set('Nem sikerült betölteni a felhasználókat');
        this.loading.set(false);
      }
    });
  }

  addRole(user: User): void {
    const currentRoles = this.newRole();
    const roleToAdd = currentRoles[user.id!]?.trim();
    if (!roleToAdd) return;

    this.userService.assignRole(user.id!, roleToAdd).subscribe({
      next: () => {
        this.newRole.update(r => ({ ...r, [user.id!]: '' }));
        this.loadUsers();
      },
      error: (err) => {
        console.error('Szerep hozzáadás hiba:', err);
      }
    });
  }

  removeRole(user: User, role: string): void {
    this.userService.removeRole(user.id!, role).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error('Szerep eltávolítás hiba:', err);
      }
    });
  }
}
