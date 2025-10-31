import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OwnerCompany, OwnerCompanyService} from '../api';

@Component({
  selector: 'app-owner-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-company-component.html'
})
export class OwnerCompanyComponent implements OnInit {
  private ownerCompanyService = inject(OwnerCompanyService);

  companies = signal<OwnerCompany[]>([]);
  newCompany = signal<OwnerCompany>({
    accountNumber: '',
    name: '',
    postalCode: 0,
    street: '',
    taxNumber: '',
    town: ''
  });
  editingCompany = signal<OwnerCompany | null>(null);

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.ownerCompanyService.ownerCompaniesGet().subscribe({
      next: (data) => this.companies.set(data),
      error: (err) => console.error('❌ Hiba a cégek betöltésekor:', err)
    });
  }

  addCompany(): void {
    const company = this.newCompany();

    // ✅ Input ellenőrzés
    if (!company.name?.trim()) {
      alert('❌ A cég neve kötelező.');
      return;
    }

    if (!company.taxNumber?.trim()) {
      alert('❌ Az adószám kötelező.');
      return;
    }

    if (!company.town?.trim()) {
      alert('❌ A város megadása kötelező.');
      return;
    }

    if (!company.street?.trim()) {
      alert('❌ Az utca megadása kötelező.');
      return;
    }

    if (!company.postalCode || company.postalCode <= 0) {
      alert('❌ A irányítószám érvényes szám kell legyen.');
      return;
    }

    // Opcionális: formátum ellenőrzés regex-szel
    const taxNumberPattern = /^[0-9]{8}-[0-9]{1}-[0-9]{2}$/; // példa: 12345678-1-12
    if (!taxNumberPattern.test(company.taxNumber)) {
      alert('❌ Az adószám formátuma érvénytelen. Példa: 12345678-1-12');
      return;
    }

    // ✅ Ha minden rendben, küldjük az API-nak
    this.ownerCompanyService.ownerCompaniesPost(company).subscribe({
      next: () => {
        this.newCompany.set({
          accountNumber: '',
          name: '',
          postalCode: 0,
          street: '',
          taxNumber: '',
          town: ''
        });
        this.loadCompanies();
      },
      error: (err) => console.error('❌ Hiba új cég létrehozásakor:', err)
    });
  }

  editCompany(company: OwnerCompany): void {
    this.editingCompany.set({ ...company });
  }

  saveEdit(): void {
    const company = this.editingCompany();
    if (!company || !company.id) return;

    this.ownerCompanyService.ownerCompaniesIdPut(company.id, company).subscribe({
      next: () => {
        this.editingCompany.set(null);
        this.loadCompanies();
      },
      error: (err) => console.error('❌ Hiba cég szerkesztéskor:', err)
    });
  }

  cancelEdit(): void {
    this.editingCompany.set(null);
  }

  deleteCompany(id: number): void {
    this.ownerCompanyService.ownerCompaniesIdDelete(id).subscribe({
      next: () => this.loadCompanies(),
      error: (err) => console.error('❌ Hiba cég törlésekor:', err)
    });
  }
}
