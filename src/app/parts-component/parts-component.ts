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
  error = signal<string |null>(null);
  private _filters = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadParts();
  }


  filters() {
    return this._filters();
  }

  updateFilter(key: string, value: string) {
    this._filters.update(f => ({ ...f, [key]: value.toLowerCase() }));
  }

  loadParts(): void {
    this.partService.sparePartsActiveGet().subscribe({
      next: (data) => this.parts.set(data),
      error: () => this.error.set('❌ Hiba az alkatrészek betöltésekor')
    });
  }

  addPart(): void {


    const raw = this.newPart() ?? {};
    const part = {
      itemName: raw.itemName?.trim() ?? '',
      itemNumber: raw.itemNumber?.trim() ?? '',
      nettoBuyingPrice: raw.nettoBuyingPrice ?? 0,
      nettoSellingPrice: raw.nettoSellingPrice ?? 0
    };

    // ✅ Input ellenőrzés

    // Megnevezés
    // Ellenőrzések
    if (!part.itemName) {
      alert('❌ Az alkatrész neve kötelező.');
      return;
    }

    if (!part.itemNumber) {
      alert('❌ A cikkszám kötelező.');
      return;
    }

    if (part.nettoBuyingPrice < 0) {
      alert('❌ A beszerzési árnak 0 vagy nagyobb számnak kell lennie.');
      return;
    }

    if (part.nettoSellingPrice < 0) {
      alert('❌ Az eladási árnak 0 vagy nagyobb számnak kell lennie.');
      return;
    }

    if (part.nettoSellingPrice <= part.nettoBuyingPrice) {
      alert('❌ Az eladási ár nem lehet kisebb, vagy egyenlő mint a beszerzési ár.');
      return;
    }

    this.partService.sparePartsPost(this.newPart()).subscribe({
      next: () => {
        this.newPart.set({
          itemName: '',
          itemNumber: '',
          nettoBuyingPrice: 0,
          nettoSellingPrice: 0
        });
        this.loadParts();
        this.error.set(null)
      },
      error: () => this.error.set('❌ Hiba új alkatrész létrehozásakor')
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
      error: () => this.error.set('❌ Hiba alkatrész szerkesztéskor')
    });
  }

  cancelEdit(): void {
    this.editingPart.set(null);
  }

  deletePart(id: number): void {
    this.partService.sparePartsIdDelete(id).subscribe({
      next: () => this.loadParts(),
      error: () => this.error.set('❌ Az alkatrész használatban van, törlése nem lehetséges!')
    });
  }


  filteredParts() {
    const fs = this._filters();
    return this.parts()

      .filter(part =>
        Object.entries(fs).every(([key, val]) =>
          !val || (part as any)[key]?.toString().toLowerCase().includes(val.toLowerCase())
        )
      )
  }
}
