import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OwnerCompanyEmployee, OwnerCompanyEmployeeService} from '../api';

@Component({
  selector: 'app-owner-company-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-company-employee-component.html'
})
export class OwnerCompanyEmployeeComponent implements OnInit {
  private employeeService = inject(OwnerCompanyEmployeeService);

  employees = signal<OwnerCompanyEmployee[]>([]);
  newEmployee = signal<OwnerCompanyEmployee>({
    name: '',
    email: '',
    telNum: '',
    title: '',
    ownerCompanyName: undefined
  });
  editingEmployee = signal<OwnerCompanyEmployee | null>(null);
  error = signal<string | null>(null);
  private _filters = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.ownerCompanyEmployeesGet().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.error.set('❌ Hiba az alkalmazottak betöltésekor:')
    });
  }


  addEmployee(): void {
    const raw = this.newEmployee();
    const emp = {
      ...raw,
      ownerCompanyId: raw.ownerCompanyName !== undefined && raw.ownerCompanyName !== null
        ? +raw.ownerCompanyName
        : undefined
    };

    // Teljes név ellenőrzés
    if (!emp.name?.trim()) {
      alert('❌ A teljes név kötelező.');
      return;
    }

    if (!emp.telNum?.trim()) {
      alert('❌ A telefonszám kitöltése kötelező.');
      return;
    }

    // Email ellenőrzés
    if (!emp.email?.trim()) {
      alert('❌ Az email cím kötelező.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emp.email)) {
      alert('❌ Az email cím formátuma érvénytelen.');
      return;
    }


    this.employeeService.ownerCompanyEmployeesPost(emp).subscribe({
      next: () => {
        this.newEmployee.set({name: '', email: '', telNum: '', title: '', ownerCompanyName: undefined});
        this.loadEmployees();
      },
      error: ( any) => this.error.set('❌ Hiba új alkalmazott létrehozásakor:')
    });
  }


  editEmployee(emp: OwnerCompanyEmployee): void {
    this.editingEmployee.set({...emp});
  }
  filters() {
    return this._filters();
  }

  updateFilter(key: string, value: string) {
    this._filters.update(f => ({ ...f, [key]: value.toLowerCase() }));
  }
  filteredEmployees() {
    const fs = this._filters();

    return this.employees()
      // input filterek
      .filter(employee =>
        Object.entries(fs).every(([key, val]) =>
          !val || (employee as any)[key]?.toString().toLowerCase().includes(val.toLowerCase())
        )
      )
  }

  saveEdit(): void {
    const emp = this.editingEmployee();
    if (!emp || !emp.id) return;

    const fixed: OwnerCompanyEmployee = {
      ...emp,
      telNum: emp.telNum ? emp.telNum : undefined,
      ownerCompanyName: emp.ownerCompanyName ? emp.ownerCompanyName : undefined
    };

    this.employeeService.ownerCompanyEmployeesIdPut(emp.id, fixed).subscribe({
      next: (res) => {
        console.log('✅ Mentés sikeres, backend válasz:', res);
        this.editingEmployee.set(null);
        this.loadEmployees();
      },
      error: (err) => {
        this.error.set('❌ Hiba alkalmazott szerkesztéskor:');
      }
    });
  }


  cancelEdit(): void {
    this.editingEmployee.set(null);
  }

  deleteEmployee(id: number): void {
    this.employeeService.ownerCompanyEmployeesIdDelete(id).subscribe({
      next: () => this.loadEmployees(),
      error: () => this.error.set('❌ A személy profilja használatban van, törlése nem lehetséges!')
    });
  }
}
