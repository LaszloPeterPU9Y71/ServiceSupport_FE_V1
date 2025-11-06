import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  Defect,
  DefectService,
  Tool,
  ToolService,
  User,
  UserService,
  WorksheetSaveRequest,
  WorksheetService
} from '../../api';
import {Router} from '@angular/router';
import StatusEnum = WorksheetSaveRequest.StatusEnum;
import {CommonModule} from '@angular/common';
import {AuthStateService} from '../../service/auth-service';


@Component({
  selector: 'app-worksheet-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './worksheet-create.html'
})
export class WorksheetCreateComponent {
  private worksheetService = inject(WorksheetService);
  private userService = inject(UserService);
  private toolService = inject(ToolService);
  private defectService = inject(DefectService);
  private router = inject(Router);
  authState = inject(AuthStateService);
  dropdownOpen = signal(false);

  users = signal<User[]>([]);
  tools = signal<Tool[]>([]);
  selectedDefect = signal<number | undefined>(undefined);
  defects = signal<Defect[]>([]);
  newNote = signal<string>('');
  error = signal<string | null>(null);

  formData = signal<any>({
    toolId: null,
    warranty: false,
    hasWarrantyCard: false,
    hasInvoiceCopy: false,
    hasRegistrationProof: false,
    ownerDescription: '',
    assignee: null,
    notes: [],
    defectIds: []

  });

  constructor() {
    this.userService.getAllUsers().subscribe({
      next: data => this.users.set(data),
      error: ()=> this.error.set('Hiba a userek betöltésekor.')
    });

    this.toolService.toolsGet().subscribe({
      next: data => this.tools.set(data),
      error: () => this.error.set('Hiba a gépek betöltésekor.')
    });

    // 🔹 hibajelenségek betöltése
    this.defectService.defectsGet().subscribe({
      next: (data: any[]) => this.defects.set(data),
      error: (any) => this.error.set('Hiba a hibajelenségek betöltésekor.')
    });
  }

  selectTool(tool: any) {
    this.updateField('toolId', tool.id);
    this.dropdownOpen.set(false);
  }

  getToolDisplayName(toolId: number | null): string {
    const tool = this.tools().find(t => t.id === toolId);
    return tool
      ? `${tool.name} (${tool.itemNumber})`
      : '';
  }


  // 🔹 Külön metódusok minden mező frissítésére
  updateField<K extends keyof any>(field: string, value: any) {
    this.formData.update(fd => ({...fd, [field]: value}));
  }

  getDefectName(id: number): string {
    const def = this.defects().find(d => d.id === id);
    return def ? def.name! : '';
  }



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

  createWorksheet() {
    const fd = this.formData();

    if (!fd.toolId) {
      alert('❌ Kérlek, válassz eszközt!');
      return;
    }

    if (!fd.assignee) {
      alert('❌ Kérlek, válassz szerelőt!');
      return;
    }

    // Opcionális: legalább egy hibajelenség
    if (!fd.defectIds || fd.defectIds.length === 0) {
      alert('❌ Legalább egy hibajelenséget válassz!');
      return;
    }


    const payload = {
      toolId: fd.toolId,
      isWarranty: fd.warranty,
      hasWarrantyCard: fd.hasWarrantyCard,
      hasInvoiceCopy: fd.hasInvoiceCopy,
      hasRegistrationProof: fd.hasRegistrationProof,
      ownerDescription: fd.ownerDescription,
      assignee: fd.assignee,
      status: StatusEnum.Beerkezett,
      notes: fd.notes,
      defectIds: fd.defectIds,
    };
    this.worksheetService.createWorksheet(payload).subscribe({
      next: () => {
        alert('Munkalap létrehozva!');
        this.router.navigate(['/worksheet']);
      },
      error: () => this.error.set('Hiba a mentés közben.')
    });
  }
}
