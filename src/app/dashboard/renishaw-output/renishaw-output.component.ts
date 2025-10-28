import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../services/dashboard.service';
import { filter, map, tap } from 'rxjs';
import { DashboardResponse, RenishawData } from '../models/dashboard-response.model';
import { LocalStorageService } from '../services/LocalStorage.service';


Chart.register(...registerables, ChartDataLabels);
@Component({
  selector: 'app-renishaw-output',
  standalone: true,
   imports: [CommonModule],
  templateUrl: './renishaw-output.component.html',
  styleUrls: ['./renishaw-output.component.css','.././dashboard.component.css']
})


export class RenishawOutputComponent implements AfterViewInit, OnInit {
  dashboardService = inject(DashboardService);
  storage = inject(LocalStorageService);
  chart!: Chart;
  TarHourly = this.storage.get<number[]>('RENISHAW') || [];
  Actual = 0;
  Target = 0;
   today = new Date();
ngOnInit(): void {
  this.dashboardService.dashboardData$
    .subscribe((data: DashboardResponse | null) => {
      if (!data || !data.data || !data.data.renishaw) return; // 👈 tránh crash

      const renishaw = data.data.renishaw;
      this.Actual = renishaw.data?.reduce((a, b) => a + b, 0) ?? 0;
      this.Target = this.TarHourly.reduce((a, b) => a + b, 0) ?? 0;

      if (!this.chart) {
        this.initChart(renishaw);
      } else {
        this.updateChart(renishaw);
      }
    });
}

  ngAfterViewInit(): void {
  }
  private initChart(renishawData: RenishawData) {
    
    const ctx = document.getElementById('renishawChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
       labels: [ '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
        datasets: [
          {
           label: renishawData.person
  ? `${renishawData.person.id} ${renishawData.person.name.split(' ').at(-1)}`
  : 'Trang'
            ,
            data: renishawData.data ?? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#8256e9',
            borderRadius: 6,
            order: 2,
            datalabels: {
              color: '#ffffffff',
              anchor: 'center',
              align: 'center',
              font: {
                size: 28,
                weight: 'bold'
              },
              formatter: (value: any) => value > 0 ? value : ''
            }
          },
          {
            label: 'Target',
            data: this.TarHourly,
            type: 'line',
            borderColor: '#f5a623',
            borderWidth: 3,
            fill: false,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#f5a623',
            pointBorderWidth: 5,
            pointRadius: 6,
            pointHoverRadius: 10,
            order: 1,
            datalabels: { display: false, 
              font: { weight: 'bold', size: 14 },
              color: '#8256e9',
              formatter: (value: any) => value > 0 ? value : '' }
          }
        ]
      },
      options: {  responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 10,
              font: {
                size: 14,
                family: 'Poppins'
              }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            enabled: true
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#000' }
          },
          y: {
            beginAtZero: true,
            max: 10,
            ticks: { color: '#000' }
          }
        }
      }
    });
  }

  private updateChart(renishawData: any) {
    this.chart.data.datasets[0].data = renishawData.data;
    this.chart.data.datasets[1].data = this.TarHourly;
    this.chart.update();
  }
}