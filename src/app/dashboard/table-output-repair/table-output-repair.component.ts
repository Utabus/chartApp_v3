import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { filter, tap } from 'rxjs';
import { TableOutItem } from '../models/dashboard-response.model';

Chart.register(...registerables);

@Component({
  selector: 'app-table-output-repair',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-output-repair.component.html',
  styleUrls: ['./table-output-repair.component.css', '../dashboard.component.css']
})

export class TableOutputRepairComponent implements AfterViewInit, OnInit {
  dashboardService = inject(DashboardService);
  ngOnInit(): void {
    this.dashboardService.dashboardData$
     
      .subscribe(data => {

        if (!data || !data.data || !data.data.tableout) return; 
        const shipment = data.data.tableout;
        if (!this.chart) {
          this.renderChart(shipment);
        } else {
          this.updateChart(shipment);
        }
      });
  }


  @ViewChild('tableChart') tableChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  ngAfterViewInit(): void {
    // this.renderChart();
  }

  renderChart(data: TableOutItem[]) {
    const ctx = this.tableChart.nativeElement.getContext('2d');
    if (!ctx) return;


    const labels = Object.values(data).map((p: TableOutItem) => p.id + ' ' + p.name.split(' ').at(-1));
    const okData = data.map(x => x.total) ?? [3, 5, 3, 5];
    const ngData = data.map(x => x.err) ?? [2, 10, 0, 0];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'OK',
            data: okData,
            backgroundColor: '#32CD32',
            borderColor: '#32CD32',
            borderWidth: 1,
            borderRadius: 6,
            stack: 'stack1',
                datalabels: {
              color: '#ffffffff',
              anchor: 'center',
              align: 'center',
              font: {
                size: 29,
                weight: 'bold'
              },
              formatter: (value: any) => value > 0 ? value : ''
            }
          },
          {
            label: 'NG',
            data: ngData,
            backgroundColor: '#FF3B30',
            borderColor: '#FF3B30',
            borderWidth: 1,
            borderRadius: 6,
            stack: 'stack1',
              datalabels: {
              color: '#ffffffff',
              anchor: 'center',
              align: 'center',
              font: {
                size: 29,
                weight: 'bold'
              },
              formatter: (value: any) => value > 0 ? value : ''
            }
          },
        ],
      },
      options: {
        responsive: true,
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
            stacked: true,
            grid: { display: false },
            ticks: {
              color: '#333',
              font: { size: 13 },
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#eee' },
            ticks: { stepSize: 1 },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutBounce',
        },
      },
   

    });
  }


  updateChart(data: TableOutItem[]) {
  if (!this.chart || !data) return;

  // Cập nhật lại labels
  this.chart.data.labels = data.map(
    (p: TableOutItem) => p.id + ' ' + p.name.split(' ').at(-1)
  );

  // Cập nhật lại datasets
  const okData = data.map(x => x.total);
  const ngData = data.map(x => x.err);

  this.chart.data.datasets[0].data = okData; // OK dataset
  this.chart.data.datasets[1].data = ngData; // NG dataset

  // Gọi update() để refresh chart
  this.chart.update('active');
}

}
