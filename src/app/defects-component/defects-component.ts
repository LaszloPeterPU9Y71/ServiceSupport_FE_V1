import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Defect, DefectService} from '../api';

@Component({
  selector: 'app-defects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './defects-component.html'
})
export class DefectsComponent implements OnInit {
  private defectService = inject(DefectService);

  defects = signal<Defect[]>([]);
  newDefect = signal<Defect>({ name: '' });
  editingDefect = signal<Defect | null>(null);
  private _filters = signal<Record<string, string>>({});
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDefects();
  }

  loadDefects(): void {
    this.defectService.defectsGet().subscribe({
      next: (data) => this.defects.set(data),
      error: () => this.error.set('❌ Hiba a hibák betöltésekor:')
    });
  }

  addDefect(): void {
    const defectName = this.newDefect()?.name?.trim();

    // ✅ Input ellenőrzés
    if (!defectName) {
      alert('❌ Kérlek, add meg a hiba nevét!');
      return;
    }

    // Opcionális: maximum hossz ellenőrzés
    if (defectName.length > 100) {
      alert('❌ A hiba neve túl hosszú (max. 100 karakter).');
      return;
    }

    // Opcionális: csak betűk, számok és szóköz engedélyezése
    const validPattern = /^[a-zA-Z0-9\sáéíóöőúüűÁÉÍÓÖŐÚÜŰ.,-]+$/;
    if (!validPattern.test(defectName)) {
      alert('❌ A hiba neve csak betűket, számokat és alapvető írásjeleket tartalmazhat.');
      return;
    }

    // Ha minden rendben, küldjük az API-nak
    this.defectService.defectsPost({ name: defectName }).subscribe({
      next: () => {
        this.newDefect.set({ name: '' });
        this.loadDefects();
      },
      error: () => this.error.set('❌ Hiba új hiba létrehozásakor:')
    });
  }

  editDefect(defect: Defect): void {
    this.editingDefect.set({ ...defect });
  }

  saveEdit(): void {
    const defect = this.editingDefect();
    if (!defect || !defect.id) return;

    this.defectService.defectsIdPut(defect.id, defect).subscribe({
      next: () => {
        this.editingDefect.set(null);
        this.loadDefects();
      },
      error: () => this.error.set('❌ Hiba hiba szerkesztéskor:')
    });
  }

  cancelEdit(): void {
    this.editingDefect.set(null);
  }

  deleteDefect(id: number): void {
    this.defectService.defectsIdDelete(id).subscribe({
      next: () => this.loadDefects(),
      error: (err) => this.error.set('❌ A hibajelenség használatban van, törlése nem lehetséges')
    });
  }

  filters() {
    return this._filters();
  }

  updateFilter(key: string, value: string) {
    this._filters.update(f => ({ ...f, [key]: value.toLowerCase() }));
  }

  filteredDefects() {
    const fs = this._filters();

    return this.defects()
      // input filterek
      .filter(part =>
        Object.entries(fs).every(([key, val]) =>
          !val || (part as any)[key]?.toString().toLowerCase().includes(val.toLowerCase())
        )
      )
  }
}
