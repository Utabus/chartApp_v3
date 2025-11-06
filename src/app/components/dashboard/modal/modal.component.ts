import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../../services/LocalStorage.service';
import { LXAChartAssembly } from '../../../models/dashboard-response.model';
import { LXAChartAssemblyService } from '../../../services/lxa-chart-assembly.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-modal',
  standalone: true,
  imports: [CommonModule, FaIconComponent, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class DashboardModalComponent implements OnInit {
  constructor(
    private storage: LocalStorageService,
    private assemblyService: LXAChartAssemblyService
  ) {}

  isOpen = false; 
  isSaving = false;
  faGear = faGear;
  assemblyOutput: number[] = [];
  assemblies: (LXAChartAssembly & { isEdited?: boolean })[] = [];

  ngOnInit(): void {
    this.assemblyOutput = this.storage.get<number[]>('ASSEMBLY') || [];
    this.loadAssemblies();
  }

  loadAssemblies(): void {
    this.assemblyService.getAllAssembly().subscribe({
      next: (data) => {
        this.assemblies = data.map(item => ({ ...item, isEdited: false }));
      },
      error: (err) => console.error('❌ Lỗi khi lấy dữ liệu Assembly:', err)
    });
  }

  // Khi user nhập gì đó trong input
  markEdited(item: any) {
    item.isEdited = true;
  }

  addRow() {
    this.assemblies.push({
      id: 0,
      code_NV: '',
      name: '',
      code_Name: '',
      targetGr: 0,
      actualGr: 0,
      actualMember: 0,
      isEdited: true // dòng mới chắc chắn là create
    });
  }

  deleteRow(id: number) {
    this.assemblyService.deleteAssembly(id).subscribe({
      next: () => {
        this.assemblies = this.assemblies.filter(a => a.id !== id);
      },
      error: (err) => console.error('❌ Lỗi khi xóa assembly:', err)
    });
  }

  saveInfo() {
    this.isSaving = true;

    // lọc ra dòng cần tạo hoặc dòng đã chỉnh sửa
    const toSave = this.assemblies.filter(a => a.id === 0 || a.isEdited);
              this.storage.set('ASSEMBLY', this.assemblyOutput);

    if (toSave.length === 0) {
      console.log('Không có dòng nào thay đổi');
      this.isSaving = false;
      this.closeModal();
      return;
    }

    const requests = toSave.map(item =>
      item.id === 0
        ? this.assemblyService.createAssembly(item)
        : this.assemblyService.updateAssembly(item.id, item)
    );

    forkJoin(requests).subscribe({
      next: () => {
        console.log('✅ Lưu các thay đổi thành công');
        this.isSaving = false;
        this.loadAssemblies(); // refresh lại bảng
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Lỗi khi lưu:', err);
        this.isSaving = false;
      }
    });


  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }
}
