import {WorksheetListDto, WorksheetService, WorksheetStatus} from '../api';
import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-worksheet',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    RouterLink
  ],
  templateUrl: './worksheet-component.html'
})
export class WorksheetComponent {
  private worksheetService = inject(WorksheetService);
  private router = inject(Router);

  worksheets = signal<WorksheetListDto[]>([]);
  private _filters = signal<Record<string, string>>({});
  statusOptions = Object.values(WorksheetStatus);
  selectedStatus = signal<WorksheetStatus | null>(null);

  constructor() {
    this.loadWorksheets();
  }

  loadWorksheets() {
    this.worksheetService.getWorksheetList().subscribe({
      next: (data: WorksheetListDto[]) => this.worksheets.set(data),
      error: err => console.error('Hiba a worksheet-ek betöltésekor', err)
    });
  }

  filters() {
    return this._filters();
  }

  updateFilter(key: string, value: string) {
    this._filters.update(f => ({ ...f, [key]: value.toLowerCase() }));
  }

  // 🔹 Szűrt lista (input + státusz alapján)
  filteredWorksheets() {
    const fs = this._filters();

    return this.worksheets()
      // input filterek
      .filter(ws =>
        Object.entries(fs).every(([key, val]) =>
          !val || (ws as any)[key]?.toString().toLowerCase().includes(val)
        )
      )
      // státusz filter
      .filter(ws =>
        !this.selectedStatus() || ws.status === this.selectedStatus()
      );
  }

  goToWorksheet(id: number) {
    this.router.navigate(['/worksheet', id]);
  }

  filterByStatus(status: WorksheetStatus) {
    if (this.selectedStatus() === status) {
      this.selectedStatus.set(null); // újrakattintás kikapcsolja
    } else {
      this.selectedStatus.set(status);
    }
  }

  clearStatusFilter() {
    this.selectedStatus.set(null);
  }
}
