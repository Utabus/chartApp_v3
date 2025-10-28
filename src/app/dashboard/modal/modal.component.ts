import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../services/LocalStorage.service';


@Component({
  selector: 'app-dashboard-modal',
  standalone: true,
  imports: [CommonModule, FaIconComponent,FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class DashboardModalComponent implements OnInit {
  constructor(private storage : LocalStorageService) {}
  
  isOpen = false; 
  faGear = faGear;
  assemblyOutput: number[] = [];
  renishawOutput: number[] = [];

  ngOnInit(): void {
    this.assemblyOutput = this.storage.get<number[]>('ASSEMBLY') 
      || [];

    this.renishawOutput = this.storage.get<number[]>('RENISHAW') 
      || [];
  }
 openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  saveInfo() {
    this.storage.set('ASSEMBLY',this.assemblyOutput);
    this.storage.set('RENISHAW',this.renishawOutput);
    this.closeModal();
  }
}
