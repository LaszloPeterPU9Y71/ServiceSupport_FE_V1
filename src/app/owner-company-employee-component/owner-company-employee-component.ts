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

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.ownerCompanyEmployeesGet().subscribe({
      next: (data) => this.employees.set(data),
      error: (err) => console.error('❌ Hiba az alkalmazottak betöltésekor:', err)
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

    this.employeeService.ownerCompanyEmployeesPost(emp).subscribe({
      next: () => {
        this.newEmployee.set({name: '', email: '', telNum: '', title: '', ownerCompanyName: undefined});
        this.loadEmployees();
      },
      error: (err: any) => console.error('❌ Hiba új alkalmazott létrehozásakor:', err)
    });
  }


  editEmployee(emp: OwnerCompanyEmployee): void {
    this.editingEmployee.set({...emp});
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
        console.error('❌ Hiba alkalmazott szerkesztéskor:', err);
      }
    });
  }


  cancelEdit(): void {
    this.editingEmployee.set(null);
  }

  deleteEmployee(id: number): void {
    this.employeeService.ownerCompanyEmployeesIdDelete(id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => console.error('❌ Hiba alkalmazott törlésekor:', err)
    });
  }
}
