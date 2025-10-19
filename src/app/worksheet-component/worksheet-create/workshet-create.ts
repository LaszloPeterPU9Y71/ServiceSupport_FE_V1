import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Tool, ToolService, User, UserService, WorksheetSaveRequest, WorksheetService} from '../../api';
import {Router} from '@angular/router';
import StatusEnum = WorksheetSaveRequest.StatusEnum;

@Component({
  selector: 'app-worksheet-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './worksheet-create.html'
})
export class WorksheetCreateComponent {
  private worksheetService = inject(WorksheetService);
  private userService = inject(UserService);
  private toolService = inject(ToolService);
  private router = inject(Router);

  users = signal<User[]>([]);
  tools = signal<Tool[]>([]);

  formData = signal<any>({
    toolId: null,
    warranty: false,
    hasWarrantyCard: false,
    hasInvoiceCopy: false,
    hasRegistrationProof: false,
    ownerDescription: '',
    assignee: null
  });

  constructor() {
    this.userService.getAllUsers().subscribe({
      next: data => this.users.set(data),
      error: err => console.error('Hiba a userek betöltésekor:', err)
    });

    this.toolService.toolsGet().subscribe({
      next: data => this.tools.set(data),
      error: err => console.error('Hiba a gépek betöltésekor:', err)
    });
  }

  // 🔹 Külön metódusok minden mező frissítésére
  updateField<K extends keyof any>(field: string, value: any) {
    this.formData.update(fd => ({...fd, [field]: value}));
  }

  createWorksheet() {

  }

  addError() {
    window.open('/defects', '_blank');
  }

}
