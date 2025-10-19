import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SparePart, SparePartService} from '../api';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parts-component.html'
})
export class PartsComponent implements OnInit {
  private partService = inject(SparePartService);

  parts = signal<SparePart[]>([]);
  newPart = signal<SparePart>({
    itemName: '',
    itemNumber: '',
    nettoBuyingPrice: 0,
    nettoSellingPrice: 0
  });
  editingPart = signal<SparePart | null>(null);

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.partService.sparePartsGet().subscribe({
      next: (data) => this.parts.set(data),
      error: (err) => console.error('❌ Hiba a spare part-ok betöltésekor:', err)
    });
  }

  addPart(): void {
    this.partService.sparePartsPost(this.newPart()).subscribe({
      next: () => {
        this.newPart.set({
          itemName: '',
          itemNumber: '',
          nettoBuyingPrice: 0,
          nettoSellingPrice: 0
        });
        this.loadParts();
      },
      error: (err) => console.error('❌ Hiba új part létrehozásakor:', err)
    });
  }

  editPart(part: SparePart): void {
    this.editingPart.set({ ...part });
  }

  saveEdit(): void {
    const part = this.editingPart();
    if (!part || !part.id) return;

    this.partService.sparePartsIdPut(part.id, part).subscribe({
      next: () => {
        this.editingPart.set(null);
        this.loadParts();
      },
      error: (err) => console.error('❌ Hiba part szerkesztéskor:', err)
    });
  }

  cancelEdit(): void {
    this.editingPart.set(null);
  }

  deletePart(id: number): void {
    this.partService.sparePartsIdDelete(id).subscribe({
      next: () => this.loadParts(),
      error: (err) => console.error('❌ Hiba part törlésekor:', err)
    });
  }
}
