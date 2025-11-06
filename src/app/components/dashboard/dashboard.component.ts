import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AssemblyOutputComponent } from "./assembly-output/assembly-output.component";
import { RenishawOutputComponent } from "./renishaw-output/renishaw-output.component";
import { TableOutputRepairComponent } from "./table-output-repair/table-output-repair.component";
import { ShipmentChartComponent } from "./shipment-chart/shipment-chart.component";
import { DashboardService } from '../../services/dashboard.service';
import { DashboardModalComponent } from './modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LxAssyChartComponent } from './lx-assy-chart/lx-assy-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AssemblyOutputComponent, 
     TableOutputRepairComponent, 
     ShipmentChartComponent,
        DashboardModalComponent,
    FontAwesomeModule,
    LxAssyChartComponent,
    
    ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);

 ngOnInit(): void {
  // Gọi lần đầu
  this.dashboardService.loadData().subscribe();

  // Cứ 1 phút load lại 1 lần (hoặc tùy m)
  setInterval(() => {
    this.dashboardService.loadData().subscribe();
  }, 60 * 1000);
}

}