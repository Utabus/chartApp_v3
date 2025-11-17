import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { filter, tap } from 'rxjs';
import { TableOutItem } from '../../../models/dashboard-response.model';

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
  tableOutItems: TableOutItem[] = [
    { id: '1', name: 'Machine A', total: 10, err: 2, machine: '12' },
    { id: '1', name: 'Machine E', total: 12, err: 1, machine: 'KU' },
    { id: '2', name: 'Machine B', total: 15, err: 3, machine: '12' },
    { id: '3', name: 'Machine C', total: 8, err: 0, machine: '13' },
    { id: '4', name: 'Machine D', total: 20, err: 5, machine: '14' },

  ];

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

    const grouped = Object.values(data)
      // Bỏ KU ra khỏi bước cộng tổng
      .filter(item => item.machine !== 'KU')
      // Gộp theo id, cộng total + err
      .reduce((acc, item) => {
        const existing = acc.find(x => x.id === item.id);
        if (existing) {
          existing.total += item.total;
          // existing.err += item.err;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as TableOutItem[]);

    // Lấy riêng các dòng KU
    const kuItems = Object.values(data).filter(x => x.machine === 'KU');

    // Gộp lại: các dòng thường trước, KU ở cuối
    const sorted: TableOutItem[] = [...grouped, ...kuItems];

    const labels = sorted.map((p: TableOutItem) => {
      let label = p.id + ' ' + p.name.split(' ').at(-1);
      if (p.machine === 'KU') label += ' (KU)';
      return label;
    });
    const okData = sorted.map(x => x.total) ?? [3, 5, 3, 5];
    const ngData = sorted.map(x => x.err) ?? [2, 10, 0, 0];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'OK',
            data: okData,
            backgroundColor: '#2969a0ff',
            borderColor: '#2969a0ff',
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
            backgroundColor: '#ff951bff',
            borderColor: '#ff951bff',
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
              color: '#000000ff',
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

    const grouped = Object.values(data)
      // Bỏ KU ra khỏi bước cộng tổng
      .filter(item => item.machine !== 'KU')
      // Gộp theo id, cộng total + err
      .reduce((acc, item) => {
        const existing = acc.find(x => x.id === item.id);
        if (existing) {
          existing.total += item.total;
          // existing.err += item.err;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as TableOutItem[]);

    // Lấy riêng các dòng KU
    const kuItems = Object.values(data).filter(x => x.machine === 'KU');

    // Gộp lại: các dòng thường trước, KU ở cuối
    const sorted: TableOutItem[] = [...grouped, ...kuItems];

    const labels = sorted.map((p: TableOutItem) => {
      let label = p.id + ' ' + p.name.split(' ').at(-1);
      if (p.machine === 'KU') label += ' (KU)';
      return label;
    });
    const okData = sorted.map(x => x.total) ?? [3, 5, 3, 5];
    const ngData = sorted.map(x => x.err) ?? [2, 10, 0, 0];


    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = okData; // OK dataset
    this.chart.data.datasets[1].data = ngData; // NG dataset

    // Gọi update() để refresh chart
    this.chart.update('active');
  }

}
