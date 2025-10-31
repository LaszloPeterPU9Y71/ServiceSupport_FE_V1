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

  ngOnInit(): void {
    this.loadDefects();
  }

  loadDefects(): void {
    this.defectService.defectsGet().subscribe({
      next: (data) => this.defects.set(data),
      error: (err) => console.error('❌ Hiba a hibák betöltésekor:', err)
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
      error: (err) => console.error('❌ Hiba új hiba létrehozásakor:', err)
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
      error: (err) => console.error('❌ Hiba hiba szerkesztéskor:', err)
    });
  }

  cancelEdit(): void {
    this.editingDefect.set(null);
  }

  deleteDefect(id: number): void {
    this.defectService.defectsIdDelete(id).subscribe({
      next: () => this.loadDefects(),
      error: (err) => console.error('❌ Hiba hiba törlésekor:', err)
    });
  }
}
