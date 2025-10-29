import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OwnerCompanyEmployee, OwnerCompanyEmployeeService, Tool, ToolService} from '../api';


@Component({
  selector: 'app-tool-table',
  standalone: true,
  templateUrl: './tool-component.html',
  imports: [CommonModule, FormsModule],
})
export class ToolComponent implements OnInit {
  tools = signal<Tool[]>([]);
  customers = signal<OwnerCompanyEmployee[]>([]);

  filters = signal<Partial<Record<string, string>>>({});

  newTool: Tool = {
    name: '',
    typeNumber: '',
    itemNumber: '',
    serialNumber: '',
    owner: undefined, // ezt a dropdown fogja beállítani
  };

  isSaving = signal(false);
  saveSuccess = signal(false);
  saveError = signal(false);

  filteredTools = computed(() => {
    const list = this.tools();
    const f = this.filters();
    return list.filter(tool =>
      (!f['tool_id'] || tool.tool_id?.toString().toLowerCase().includes(f['tool_id'].toLowerCase())) &&
      (!f['ownerName'] || tool.ownerName?.toLowerCase().includes(f['ownerName'].toLowerCase())) &&
      (!f['ownerCompanyName'] || tool.ownerCompanyName?.toLowerCase().includes(f['ownerCompanyName'].toLowerCase())) &&
      (!f['name'] || tool.name?.toLowerCase().includes(f['name'].toLowerCase())) &&
      (!f['typeNumber'] || tool.typeNumber?.toLowerCase().includes(f['typeNumber'].toLowerCase())) &&
      (!f['serialNumber'] || tool.serialNumber?.toLowerCase().includes(f['serialNumber'].toLowerCase())) &&
      (!f['itemNumber'] || tool.itemNumber?.toLowerCase().includes(f['itemNumber'].toLowerCase()))
    );
  });

  constructor(
    private toolService: ToolService,
    private ownerService: OwnerCompanyEmployeeService
  ) {}

  ngOnInit(): void {
    this.loadTools();
    this.loadCustomers();
  }

  loadTools() {
    this.toolService.toolsGet().subscribe({
      next: data => this.tools.set(data),
      error: err => console.error('Hiba történt az eszközök lekérdezésekor:', err),
    });
  }

  loadCustomers() {
    this.ownerService.ownerCompanyEmployeesGet().subscribe({
      next: data => this.customers.set(data),
      error: err => console.error('Hiba történt a kapcsolattartók lekérdezésekor:', err),
    });
  }

  updateFilter(field: string, value: string) {
    this.filters.update(prev => ({ ...prev, [field]: value }));
  }

  resetForm() {
    this.newTool = {
      name: '',
      typeNumber: '',
      itemNumber: '',
      serialNumber: '',
      owner: undefined,
    };
    this.saveSuccess.set(false);
    this.saveError.set(false);
  }

  createTool() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(false);

    this.toolService.toolsPost(this.newTool).subscribe({
      next: created => {
        this.tools.update(list => [...list, created]);
        this.saveSuccess.set(true);
        this.isSaving.set(false);
        this.resetForm();
      },
      error: err => {
        console.error('Hiba történt az eszköz mentésekor:', err);
        this.saveError.set(true);
        this.isSaving.set(false);
      },
    });
  }
}
