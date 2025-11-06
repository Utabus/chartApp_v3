import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { LXAChartAssemblyService } from '../../../services/lxa-chart-assembly.service';
import { LXAChartAssembly } from '../../../models/dashboard-response.model';

@Component({
  selector: 'app-lx-assy-chart',
  standalone: true,
  imports: [],
  templateUrl: './lx-assy-chart.component.html',
  styleUrls: ['./lx-assy-chart.component.css', '../dashboard.component.css']
})
export class LxAssyChartComponent implements AfterViewInit, OnInit {
  constructor(
    private assemblyService: LXAChartAssemblyService
  ) { }
  ngAfterViewInit(): void {
  }
  assemblies: (LXAChartAssembly)[] = [];

  ngOnInit(): void {
    this.loadAssemblies();
  }
  @ViewChild('assyChart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;



  loadAssemblies(): void {
    this.assemblyService.getAllAssembly().subscribe({
      next: (data) => {
        this.assemblies = data.map(item => ({ ...item, isEdited: false }));
        this.renderChart();
      },
      error: (err) => console.error('❌ Lỗi khi lấy dữ liệu Assembly:', err)
    });
  }



  renderChart(): void {
    if (!this.chartRef?.nativeElement) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');

    const labels = this.assemblies.map(a => {
      const parts = a.name.split(' ');
      const lastWord = parts[parts.length - 1];
      return `${a.code_NV}-${lastWord}`;
    });
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

    const actualMember = this.assemblies.map(a => a.actualMember || 0); // giả sử có field actual
    const actualGroup = this.assemblies[0]?.actualGr ?? 1.725;
    const targetGroup = this.assemblies[0]?.targetGr ?? 1.858;

    // nếu chart cũ đã tồn tại thì destroy để tránh leak
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Member',
            data: actualMember,
            backgroundColor: '#025fae',
            borderRadius: 5,
            datalabels: {
              anchor: 'end',
              align: 'start',
              color: 'black',
              backgroundColor: 'orange',
              borderRadius: 3,
              font: { weight: 'bold', size: 14 },
              formatter: (value: number) => value ? value.toFixed(3) : ''
            },
          },
          {
            label: 'Actual Group',
            data: new Array(labels.length).fill(actualGroup),
            type: 'line',
            borderColor: 'green',
            borderWidth: 3,
            fill: false,
            pointRadius: 0,
            datalabels: { display: false },
            pointStyle: 'line',
          },
          {
            label: 'Target Group',
            data: new Array(labels.length).fill(targetGroup),
            type: 'line', borderColor: 'red',
            borderWidth: 3, borderDash: [6, 6],
            fill: false, pointRadius: 0,
            datalabels: { display: false },
            pointStyle: 'line',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#333',
              usePointStyle: true, // quan trọng nè
              pointStyleWidth: 20,
              boxWidth: 10,
              font: { family: 'Poppins', size: 13 },
            }
          },
          title: {
            display: true,
            text: 'SPH (MTD)',
            font: { size: 20, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 2.4,
            title: { display: true, text: 'SPH (set/Hour)' },
          },
        },
      },
      plugins: [legendLineFixPlugin]
    });
  }

}