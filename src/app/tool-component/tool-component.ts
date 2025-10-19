import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Tool, ToolService} from '../api';


@Component({
  selector: 'app-tool-table',
  standalone: true,
  templateUrl: './tool-component.html',
  imports: [CommonModule, FormsModule],
})
export class ToolComponent implements OnInit {

  tools = signal<Tool[]>([]);

  // a filterek minden mezőre
  filters = signal<Partial<Record<string, string>>>({});

  // computed, ami kiszámolja a szűrt listát
  filteredTools = computed(() => {
    const all = this.tools();
    const f = this.filters();

    return all.filter(tool =>
      // státusz szűrés

      // mező szűrések
      (!f['tool_id'] || tool.tool_id?.toString().toLowerCase().includes(f['tool_id'].toLowerCase())) &&
      (!f['ownerName'] || tool.ownerName?.toLowerCase().includes(f['ownerName'].toLowerCase())) &&
      (!f['ownerCompanyName'] || tool.ownerCompanyName?.toLowerCase().includes(f['ownerCompanyName'].toLowerCase())) &&
      (!f['name'] || tool.name?.toLowerCase().includes(f['name'].toLowerCase())) &&
      (!f['typeNumber'] || tool.typeNumber?.toLowerCase().includes(f['typeNumber'].toLowerCase())) &&
      (!f['serialNumber'] || tool.serialNumber?.toLowerCase().includes(f['serialNumber'].toLowerCase())) &&
      (!f['itemNumber'] || tool.itemNumber?.toLowerCase().includes(f['itemNumber'].toLowerCase()))
    );
  });

  constructor(private toolService: ToolService) {
  }

  ngOnInit(): void {
    this.toolService.toolsGet().subscribe({
      next: (data: Tool[]) => this.tools.set(data),
      error: (err: any) => console.error('Hiba történt az eszközök lekérdezésekor:', err),
    });
  }

  updateFilter(field: string, value: string): void {
    this.filters.set({
      ...this.filters(),
      [field]: value,
    });
  }


}
