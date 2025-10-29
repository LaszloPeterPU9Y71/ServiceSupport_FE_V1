import {Component, effect, inject, signal} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {
  Defect,
  DefectService, SparePart,
  SparePartService, SparePartUsage, User,
  UserService,
  WorksheetDetail,
  WorksheetService,
  WorksheetStatus
} from '../../api';
import {DatePipe, SlicePipe} from '@angular/common';
import {AuthStateService} from '../../service/auth-service';

@Component({
  selector: 'app-worksheet-details',
  standalone: true,
  imports: [FormsModule, DatePipe, SlicePipe],
  templateUrl: './worksheet-details.html',
})
export class WorksheetDetailsComponent {
  private route = inject(ActivatedRoute);
  private worksheetService = inject(WorksheetService);
  private defectService = inject(DefectService);
  private sparePartsService = inject(SparePartService);
  private userService = inject(UserService);
  authState = inject(AuthStateService);
  worksheet = signal<WorksheetDetail | undefined>(undefined);
  formData = signal<any>(undefined);

  defects = signal<Defect[]>([]);
  statusOptions = Object.values(WorksheetStatus);
  totalGross = signal(0);
  spareParts = signal<SparePart[]>([]);
  users = signal<User[]>([]);


  newNote = signal<string>('');
  selectedDefect = signal<number | undefined>(undefined);
  selectedSparePart = signal<SparePart | undefined>(undefined);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.worksheetService.getWorksheetDetails(+id).subscribe({
        next: data => {
          console.log('Betöltött worksheet:', data);
          this.worksheet.set(data);

          this.formData.set({
            toolId: data.tool?.id,
            defectIds: data.defects?.map(d => d.id) ?? [],
            notes: data.notes ?? [],
            isWarranty: data.isWarranty ?? false,
            hasWarrantyCard: data.hasWarrantyCard ?? false,
            hasInvoiceCopy: data.hasInvoiceCopy ?? false,
            hasRegistrationProof: data.hasRegistrationProof ?? false,
            assignee: data.assignedUser?.id,
            status: data.status,
            spareParts: data.spareParts ?? []
          });
        }
      });
    }

    // 🔹 hibajelenségek betöltése
    this.defectService.defectsGet().subscribe({
      next: (data: any[]) => this.defects.set(data),
      error: (err: any) => console.error('Hiba a hibajelenségek betöltésekor:', err)
    });

    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users.set(data);
      },
      error: err => console.error('Hiba a userek betöltésekor:', err)
    });

    this.sparePartsService.sparePartsGet().subscribe({
      next: (data: SparePart[]) => {
        this.spareParts.set(data);
        this.filteredSpareParts.set(data); // alapból minden látszik
      },
      error: err => console.error('Hiba az alkatrészek betöltésekor:', err)
    });


    effect(() => {
      const fd = this.formData();
      if (fd?.spareParts) {
        this.totalGross.set(
          fd.spareParts.reduce(
            (sum: number, p: any) => sum + (p.netPrice ?? 0) * (p.quantity ?? 0),
            0
          )
        );
      }
    });
  }

  // Hibajelenségek
  addDefect() {
    if (this.selectedDefect() != null) {
      this.formData.update(fd => ({
        ...fd,
        defectIds: [...new Set([...fd.defectIds, this.selectedDefect()])]
      }));
      this.selectedDefect.set(undefined);
    }
  }


  removeDefect(id: number) {
    this.formData.update(fd => ({
      ...fd,
      defectIds: fd.defectIds.filter((d: number) => d !== id)
    }));
  }

  // Megjegyzések
  addNote() {
    if (this.newNote().trim()) {
      this.formData.update(fd => ({
        ...fd,
        notes: [
          ...fd.notes,
          {
            userId: this.authState.userId(),
            noteText: this.newNote(),
            userName: this.authState.username(),
            postedDate: new Date().toISOString()
          }
        ]
      }));
      this.newNote.set('');
    }
  }

  removeNote(noteId: number) {
    this.formData.update(fd => ({
      ...fd,
      notes: fd.notes.filter((n: any) => n.noteId !== noteId)
    }));
  }

  // Alkatrészek
  updateQuantity(index: number, quantity: number) {
    this.formData.update(fd => {
      const newParts = [...fd.spareParts];
      newParts[index].quantity = quantity;
      return {...fd, spareParts: newParts};
    });
  }

  addSpareParts() {
    const selected = this.selectedSparePart();
    if (selected != null) {
      this.formData.update(fd => {
        const existing = fd.spareParts.find(
          (spu: SparePartUsage) => spu.sparePart?.itemNumber === selected.itemNumber
        );

        if (existing) {
          existing.quantity += 1;
          return {...fd};
        } else {
          const newUsage: SparePartUsage = {
            sparePart: selected,
            quantity: 1
          };
          return {
            ...fd,
            spareParts: [...fd.spareParts, newUsage]
          };
        }
      });

      this.selectedSparePart.set(undefined);
      this.searchTerm.set('')
    }
  }

  searchTerm = signal<string>('');
  filteredSpareParts = signal<SparePart[]>([]);
  dropdownOpen = signal<boolean>(false);

  filterSpareParts(term: string) {
    this.searchTerm.set(term);
    const all = this.spareParts();
    if (!term.trim()) {
      this.filteredSpareParts.set(all);
    } else {
      this.filteredSpareParts.set(
        all.filter(sp =>
          sp.itemName?.toLowerCase().includes(term.toLowerCase()) ||
          sp.itemNumber?.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
    this.dropdownOpen.set(true); // keresés közben nyitva tartjuk
  }

  setSelectedSparePart(sparePart: SparePart) {
    this.selectedSparePart.set(sparePart)
    this.searchTerm.set(sparePart.itemName!)
    this.dropdownOpen.set(false);
  }


  removeSparePart(index: number) {
    this.formData.update(fd => ({
      ...fd,
      spareParts: fd.spareParts.filter((_: any, i: number) => i !== index)
    }));
  }


  getDefectName(id: number): string {
    const def = this.defects().find(d => d.id === id);
    return def ? def.name! : '';
  }

  closeDropdownOnBlur() {
    setTimeout(() => {
      this.dropdownOpen.set(false);
    }, 150);
  }

//  protected readonly of = of;

  setAssignee(userId: number) {
    this.formData.update(fd => ({
      ...fd,
      assignee: userId
    }));
  }

  save() {
    const fd = this.formData();
    if (!fd) {
      console.error('Nincs formData betöltve!');
      return;
    }

    const payload = {
      toolId: fd.toolId,
      defectIds: fd.defectIds,
      notes: fd.notes.map((n: any) => ({
        noteId: n.noteId,
        noteText: n.noteText,
        userId: n.userId,
        postedDate: n.postedDate
      })),
      isWarranty: fd.isWarranty,
      hasWarrantyCard: fd.hasWarrantyCard,
      hasInvoiceCopy: fd.hasInvoiceCopy,
      hasRegistrationProof: fd.hasRegistrationProof,
      assignee: fd.assignee,
      status: fd.status,
      spareParts: fd.spareParts.map((p: any) => ({
        sparePartId: p.sparePartId ?? p.sparePart?.id, // ha sparePart objektumból jön
        quantity: p.quantity
      }))
    };

    console.log('Mentés payload:', payload);

    this.worksheetService.worksheetIdUpdatePut(fd.toolId, payload).subscribe({
      next: () => {
        alert('Munkalap sikeresen mentve!');
      },
      error: (err) => {
        console.error('Hiba mentés közben:', err);
        alert('Mentés sikertelen!');
      }
    });
  }

}
