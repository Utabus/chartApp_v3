import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../../../services/dashboard.service';
import { AssemblyData, DashboardResponse } from '../../../models/dashboard-response.model';
import { LocalStorageService } from '../../../services/LocalStorage.service';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-assembly-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assembly-output.component.html',
  styleUrls: ['./assembly-output.component.css', '../dashboard.component.css']
})
export class AssemblyOutputComponent implements AfterViewInit, OnInit {
  dashboardService = inject(DashboardService);
  storage = inject(LocalStorageService);
  Actual = 0;
  Target = 0;
  today = new Date();
  TarHourly = this.storage.get<number[]>('ASSEMBLY') || [];

  ngOnInit(): void {
    this.dashboardService.dashboardData$
      .subscribe((data: DashboardResponse | null) => {
        if (!data || !data.data) return; // 👈 chặn null ở đây
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
    gradientAcc.addColorStop(0, '#8a8a8aff');
    gradientAcc.addColorStop(1, '#8a8a8aff');

    const gradientHourly = ctx!.createLinearGradient(0, 0, 0, 300);
    gradientHourly.addColorStop(0, '#025fae');
    gradientHourly.addColorStop(1, '#025fae');

    const OutAcc = [0,...this.TarHourly ?? []];
    const OutHourly = [0,...assemblyData?.data ?? []];

    const TarAcc = [0,...assemblyData?.data?.reduce((acc: number[], curr: number, index) => {
      acc.push((acc[index - 1] || 0) + curr);
      return acc;
    }, []) ?? []];
    const legendLineFixPlugin = {
      id: 'legendLineFix',
      afterUpdate(chart: any) {
        const legend = chart.legend;
        if (!legend) return;

        legend.legendItems.forEach((item: any) => {
          const dataset = chart.data.datasets[item.datasetIndex];

          if (dataset.type === 'line') {
            // 🔹 Màu & nét cơ bản
            item.strokeStyle = dataset.borderColor;
            item.lineWidth = dataset.borderWidth ?? 2;

            // 🔹 Bo đầu line & style nối
            item.lineCap = 'round';
            item.lineJoin = 'round';

            // 🔹 Tuỳ chỉnh nét đứt (dash length, gap length)
            if (dataset.borderDash) {
              // Ví dụ: dash 10px, gap 5px — nhìn thanh thoát hơn
              item.lineDash = [10, 5];
              item.lineDashOffset = 0;
            }

            // 🔹 Tăng chiều dài biểu tượng line trong legend (mặc định là ngắn)
            item.lineWidth = 3; // tăng độ dày
            item.lineDashOffset = 1; // nhẹ chút để “so le” cho đẹp
          }
        });
      }
    };


    this.chart = new Chart(ctx!, {
      data: {
        labels: ['6h','7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
        datasets: [
          {
            type: 'bar',
            label: 'Output Plan',
            data: OutAcc,
            backgroundColor: gradientAcc,
            barThickness: 30,
            order: 1,
            pointStyle: 'rect'
          },
          {
            type: 'bar',
            label: 'Output Actual ',
            data: OutHourly,
            backgroundColor: gradientHourly,
            barThickness: 25,
            order: 2,
            pointStyle: 'rect'
          },
          {
            type: 'line',
            label: 'Plan Acc',
            data: [0,...this.TarHourly.reduce((acc: number[], curr: number, index) => {
              acc.push((acc[index - 1] || 0) + curr);
              return acc;
            }, []) ],
            borderColor: '#8a8a8aff',
            borderWidth: 4,
            pointBackgroundColor: '#8a8a8aff',
            pointBorderColor: '#8a8a8aff',
            borderDash: [8, 4],
            fill: true,
            datalabels: {
              display: false,
            },
            order: 4,
            pointStyle: 'line',

          },
          {
            type: 'line',
            label: 'Actual Acc',
            data: TarAcc,
            borderColor: '#025fae',
            borderWidth: 4,
            pointBackgroundColor: '#025fae',
            pointBorderColor: '#025fae',
            fill: true,
             backgroundColor: 'rgba(57, 150, 250, 0.1)', // ✅ màu nền trong suốt nhẹ
            order: 3,
            datalabels: { display: false ,
              font: { weight: 'bold', size: 10,color: '#025fae'},


            },
            pointStyle: 'line',
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
              usePointStyle: true,
              pointStyleWidth: 40,
              boxWidth: 10,
              font: { family: 'Poppins', size: 13, },

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
            color: '#2e2e2eff',

            font: { weight: 'bold', size: 26, },
            anchor: 'center',
            align: 'center',
            formatter: (value: number) => (value !== 0 ? value : '')
          }
        },
        scales: {
          x: {
            offset: false, // 👈 giúp cột đầu tiên dính sát trục Y
            grid: { display: false },
            ticks: {
              color: '#000000ff',
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
      plugins: [ChartDataLabels, legendLineFixPlugin] // 👈 thêm plugin này
    });
  }
  updateChart(assemblyData?: AssemblyData) {
    if (!this.chart || !assemblyData) return;

    const OutHourly = [0,...assemblyData.data ?? []];
    const OutAcc = [0,...assemblyData.data.reduce((acc: number[], curr: number, index) => {
      acc.push((acc[index - 1] || 0) + curr);
      return acc;
    }, [])];
    const TarHourly = [0,...this.TarHourly ?? []];
    const TarAcc = [0,...this.TarHourly.reduce((acc: number[], curr: number, index) => {
      acc.push((acc[index - 1] || 0) + curr);
      return acc;
    }, [])];

    this.chart.data.datasets[0].data = TarHourly;     // Out Acc
    this.chart.data.datasets[1].data = OutHourly;  // Out Hourly
    this.chart.data.datasets[2].data = TarAcc;     // Target (cộng dồn)
    this.chart.data.datasets[3].data = OutAcc;  // Target Hourly

    this.chart.update();
  }


}
