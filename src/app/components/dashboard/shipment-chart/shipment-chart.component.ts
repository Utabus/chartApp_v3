import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ShipmentData } from '../../../models/dashboard-response.model';
import { DashboardService } from '../../../services/dashboard.service';
import { filter, tap } from 'rxjs';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-shipment-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-chart.component.html',
  styleUrls: ['./shipment-chart.component.css', '.././dashboard.component.css']
})
export class ShipmentChartComponent implements AfterViewInit, OnInit {
  dashboardService = inject(DashboardService);
  Actual = 0;
  Target = 0;
  today = new Date();
  ngOnInit(): void {
    this.dashboardService.dashboardData$
      .subscribe(data => {
        if (!data || !data.data || !data.data.shipment) return;
        const shipment = data.data.shipment;
        this.Actual = shipment?.actual[0] ?? 0;
        this.Target = shipment?.target[0] ?? 0;

        if (!this.chart) {
          this.renderChart(shipment);
        } else {
          this.updateChart(shipment);
        }
      });
  }


  @ViewChild('shipmentChart') shipmentChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  ngAfterViewInit(): void {
    // this.renderChart();
  }

  private renderChart(Data: ShipmentData) {
    const ctx = this.shipmentChart.nativeElement.getContext('2d');

    // Dữ liệu ví dụ
    const totalPlan = Data.target ?? [84, 120, 80, 94]; // tổng plan
    const finished = Data.actual ?? [84, 80, 52, 84]; // đã hoàn thành
    const labels = Data.deliveryDate ?? ['13/10', '14/10', '15/10', '16/10'];

    const finishedDataset: number[] = [];
    const unfinishedDataset: number[] = [];
    const finishedTodayDataset: number[] = [];

    // Logic xử lý từng ngày
    for (let i = 0; i < labels.length; i++) {
      const total = totalPlan[i];
      const done = finished[i];

      if (done >= total) {
        // Nếu hoàn thành hết → full trụ màu hồng
        finishedDataset.push(0);
        unfinishedDataset.push(0);
        finishedTodayDataset.push(total);
      } else {
        // Nếu chưa hoàn thành → xanh dưới, xám trên
        finishedDataset.push(done);
        unfinishedDataset.push(total - done);
        finishedTodayDataset.push(0);
      }
    }

    this.chart = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Finished',
            data: finishedDataset,
            backgroundColor: '#30b3bfff', // Xanh ở dưới
            borderRadius: 8,
            stack: 'Stack 0',
          },
          {
            label: 'Unfinished',
            data: unfinishedDataset,
            backgroundColor: '#ECEFF1', // Xám ở trên
            borderRadius: 8,
            stack: 'Stack 0',
          },
          {
            label: 'Finished (Today)',
            data: finishedTodayDataset,
            backgroundColor: '#ffacdaff', // Hồng full nếu done >= total
            borderRadius: 8,
            stack: 'Stack 0',
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 14, family: 'Poppins' },
              usePointStyle: true
            }
          },
          datalabels: {
            display: (context) => {
              // 🔥 Chỉ hiển thị cho Finished và Unfinished
              return ['Finished', 'Unfinished', 'Finished (Today)'].includes(context.dataset.label!);
            },
            formatter: (value, ctx) => {
              const datasets = ctx.chart.data.datasets;
              const finished = (datasets[0]?.data?.[ctx.dataIndex] as number) || 0;
              const unfinished = (datasets[1]?.data?.[ctx.dataIndex] as number) || 0;
              const finishedToday = (datasets[2]?.data?.[ctx.dataIndex] as number) || 0;

              const total = finished + unfinished + finishedToday;
              const done = finished + finishedToday;
              const percent = total === 0 ? 0 : Math.round((done / total) * 100);

              if (ctx.dataset.label === 'Finished (Today)' && finishedToday > 0)
                return `   ${done}\n(${percent}%)`;

              if (ctx.dataset.label === 'Finished' && finishedToday === 0 && done > 0)
                return `   ${done}\n(${percent}%)`;

              if (ctx.dataset.label === 'Unfinished' && unfinished > 0) 
                return `${unfinished}`;

              return '';
            },
            color: (ctx) => {
              switch (ctx.dataset.label) {
                case 'Unfinished':
                  return '#fc0000ff'; // chữ đen nổi trên nền xám
                case 'Finished (Today)':
                  return '#ffffffff';
                default:
                  return '#ffffffff';
              }
            },
            anchor: (ctx) => {
              if (ctx.dataset.label === 'Unfinished') return 'center';
              return 'center';
            },
            align: (ctx) => {
              if (ctx.dataset.label === 'Unfinished') return 'center';
              return 'center';
            },
            font: { size: 20, weight: 'bold' },
            clamp: true
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              font: {
                size: 14,
                family: 'Poppins',


              },
              color: 'black'
            }
          },
          y: {
            stacked: true,
            grid: { color: '#F0F0F0' },
            ticks: { font: { family: 'Poppins', size: 12 }, color: 'black' }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  updateChart(Data: ShipmentData) {
    if (!this.chart || !Data) return;

    // --- Cập nhật dữ liệu ---
    const totalPlan = Data.target ?? [84, 120, 80, 94];
    const finished = Data.actual ?? [84, 80, 52, 84];
    const labels = Data.deliveryDate ?? ['13/10', '14/10', '15/10', '16/10'];

    const finishedDataset: number[] = [];
    const unfinishedDataset: number[] = [];
    const finishedTodayDataset: number[] = [];

    for (let i = 0; i < labels.length; i++) {
      const total = totalPlan[i];
      const done = finished[i];

      if (done >= total) {
        finishedDataset.push(0);
        unfinishedDataset.push(0);
        finishedTodayDataset.push(total);
      } else {
        finishedDataset.push(done);
        unfinishedDataset.push(total - done);
        finishedTodayDataset.push(0);
      }
    }

    // --- Cập nhật lại labels và datasets ---
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = finishedDataset;       // Finished
    this.chart.data.datasets[1].data = unfinishedDataset;     // Unfinished
    this.chart.data.datasets[2].data = finishedTodayDataset;  // Finished (Today)

    // --- Cập nhật chart ---
    this.chart.update('active'); // hiệu ứng smooth mượt như dashboard chuyên nghiệp 😎
  }

}
