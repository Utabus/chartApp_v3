import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../services/dashboard.service';
import { AssemblyData, DashboardResponse } from '../models/dashboard-response.model';
import { LocalStorageService } from '../services/LocalStorage.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-assembly-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assembly-output.component.html',
  styleUrls: ['./assembly-output.component.css', '../dashboard.component.css']
})
export class AssemblyOutputComponent implements AfterViewInit ,OnInit {
  dashboardService = inject(DashboardService);
  storage = inject(LocalStorageService);
  Actual = 0;
  Target = 0;
   today = new Date();
  TarHourly =this.storage.get<number[]>('ASSEMBLY') || [];
  
ngOnInit(): void {
  this.dashboardService.dashboardData$
    .subscribe((data: DashboardResponse | null) => {
      if (!data || !data.data) return; // 👈 chặn null ở đây
console.log('Dashboard Data:', this.TarHourly);
      const assembly = data.data.assembly;
      this.Actual = assembly?.data?.reduce((a, b) => a + b, 0) ?? 0;
      this.Target = this.TarHourly.reduce((a, b) => a + b, 0) ?? 0;

     if (!this.chart) {
  this.renderChart(assembly);
} else {
  this.updateChart(assembly);
}

    });
}

  @ViewChild('assemblyChart') assemblyChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  ngAfterViewInit(): void {
    }

  renderChart(assemblyData?: AssemblyData) {
    const ctx = this.assemblyChart.nativeElement.getContext('2d');

    const gradientAcc = ctx!.createLinearGradient(0, 0, 0, 300);
    gradientAcc.addColorStop(0, '#FFD84D');
    gradientAcc.addColorStop(1, '#F5B900');

    const gradientHourly = ctx!.createLinearGradient(0, 0, 0, 300);
    gradientHourly.addColorStop(0, 'rgba(0,123,255,0.3)');
    gradientHourly.addColorStop(1, 'rgba(0,123,255,0.8)');
   const OutAcc = assemblyData?.data?.reduce((acc: number[], curr: number, index) => {
  acc.push((acc[index - 1] || 0) + curr);
  return acc;
}, []);
    const OutHourly =assemblyData?.data;

    const TarAcc =  assemblyData?.data?.reduce((acc: number[], curr: number, index) => {
  acc.push((acc[index - 1] || 0) + curr);
  return acc;
}, []);

    this.chart = new Chart(ctx!, {
      data: {
        labels: [ '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
        datasets: [
          {
            type: 'bar',
            label: 'Out Acc',
            data: OutAcc,
            backgroundColor: gradientAcc,
            borderRadius: 8,
            barThickness: 30,
              order: 2
          },
          {
            type: 'bar',
            label: 'Out Hourly',
            data: OutHourly,
            backgroundColor: gradientHourly,
            borderRadius: 8,
            barThickness: 25,

          },
          {
            type: 'line',
            label: 'Targer',
          data: TarAcc,
            borderColor: '#FFC107',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#FFC107',
            pointRadius: 0,
            datalabels: {
              display: false
            }

          } as any,
          {
            type: 'line',
            label: 'Targer Hourly',
            data: this.TarHourly,
            borderColor: '#007bff',
            borderWidth: 3,
            borderDash: [5, 5],
            pointBackgroundColor: '#007bff',
            order: 1,
            pointRadius: 0,
               datalabels: {
              display: false
            }

          } as any
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#333',
              font: { family: 'Poppins', size: 13 },
            }
          },
          tooltip: {
            backgroundColor: '#1e1e1e',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 6,
            padding: 10,
            displayColors: true,
          },
          datalabels: {
            color: '#3b3b3bff',
            
            font: { weight: 'bold', size: 26, },
            anchor: 'center',
            align: 'center',
            formatter: (value: number) => (value !== 0 ? value : '')
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#555',
              font: { family: 'Roboto, sans-serif', size: 12 }
            }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#555',
              font: { family: 'Roboto, sans-serif', size: 12 },
              stepSize: 10
            },
            beginAtZero: true
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
  updateChart(assemblyData?: AssemblyData) {
  if (!this.chart || !assemblyData) return;

  // Dữ liệu mới từ API
  const OutAcc = assemblyData.data.reduce((acc: number[], curr: number, index) => {
    acc.push((acc[index - 1] || 0) + curr);
    return acc;
  }, []);

  const OutHourly = assemblyData.data;
  const TarAcc = OutHourly.reduce((acc: number[], curr: number, index) => {
    acc.push((acc[index - 1] || 0) + curr);
    return acc;
  }, []);

  // Cập nhật datasets trong chart
  this.chart.data.datasets[0].data = OutAcc;      // Out Acc
  this.chart.data.datasets[1].data = OutHourly;   // Out Hourly
  this.chart.data.datasets[2].data = TarAcc;      // TAR
  this.chart.data.datasets[3].data = this.TarHourly; // Tar Hourly

  // Gọi update để render lại chart
  this.chart.update();
}

}
