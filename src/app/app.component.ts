import {Component, OnInit} from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'charts-app';
  canvas: HTMLCanvasElement;
  myChart;

  /**
   * init
   */
  ngOnInit(): void {
    const baseController = Chart.controllers.bar;
    const originalDraw = Chart.controllers.bar.prototype.draw;

    this.canvas = <any>document.getElementById('chart');
    const context = this.canvas.getContext('2d');
    const gradient = this.createGradient(context);

    Chart.helpers.drawRoundedTopRectangle = (ctx, x, y, width, height, radius) => {
      console.log('x: ', x);
      console.log('y: ',y);
      console.log('width: ', width);
      console.log('height: ', height);
      console.log('radius: ', radius);
      if (height >= 0) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        // top right corner
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        // bottom right corner
        ctx.lineTo(x + width, y + height);
        // bottom left corner
        ctx.lineTo(x, y + height);
        // top left
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        // bottom right corner
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y - radius);
        // top right corner
        ctx.lineTo(x + width, y + height);
        // top left corner
        ctx.lineTo(x, y + height);
        // bottom left
        ctx.lineTo(x, y - radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }
    };

    // @ts-ignore
    Chart.elements.RoundedTopRectangle = Chart.elements.Rectangle.extend({
      draw() {
        const ctx = this._chart.ctx;
        const vm = this._view;
        let left, right, top, bottom, signX, signY, borderSkipped;
        let borderWidth = vm.borderWidth;

        console.log('vm: ', vm);

        if (!vm.horizontal) {
          // bar
          left = vm.x - vm.width / 2;
          right = vm.x + vm.width / 2;
          top = vm.y;
          bottom = vm.base;
          signX = 1;
          signY = bottom > top? 1: -1;
          borderSkipped = vm.borderSkipped || 'bottom';
        } else {
          // horizontal bar
          left = vm.base;
          right = vm.x;
          top = vm.y - vm.height / 2;
          bottom = vm.y + vm.height / 2;
          signX = right > left? 1: -1;
          signY = 1;
          borderSkipped = vm.borderSkipped || 'left';
        }

        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (borderWidth) {
          // borderWidth shold be less than bar width and bar height.
          const barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
          borderWidth = borderWidth > barSize? barSize: borderWidth;
          const halfStroke = borderWidth / 2;
          // Adjust borderWidth when bar top position is near vm.base(zero).
          const borderLeft = left + (borderSkipped !== 'left'? halfStroke * signX: 0);
          const borderRight = right + (borderSkipped !== 'right'? -halfStroke * signX: 0);
          const borderTop = top + (borderSkipped !== 'top'? halfStroke * signY: 0);
          const borderBottom = bottom + (borderSkipped !== 'bottom'? -halfStroke * signY: 0);
          // not become a vertical line?
          if (borderLeft !== borderRight) {
            top = borderTop;
            bottom = borderBottom;
          }
          // not become a horizontal line?
          if (borderTop !== borderBottom) {
            left = borderLeft;
            right = borderRight;
          }
        }

        // calculate the bar width and roundess
        const barWidth = Math.abs(left - right);
        const roundness = this._chart.config.options.barRoundness || 0.5;
        const radius = barWidth * roundness * 0.5;

        // keep track of the original top of the bar
        const prevTop = top;

        // move the top down so there is room to draw the rounded top
        top = prevTop + radius;
        const barRadius = top - prevTop;

        // console.log('left: ', left);
        // console.log('top: ', prevTop);
        // console.log('right: ', right);
        // console.log('bottom: ', bottom);
        //
        // console.log('bottom - top: ', bottom - top);
        const gdt = ctx.createLinearGradient(left, top, right, bottom);
        if (top < bottom) {
          gdt.addColorStop(0, '#0086fb');
          gdt.addColorStop(1, '#50d3f2');
        } else {
          gdt.addColorStop(1, '#d1d1d1');
          gdt.addColorStop(0, '#9e9e9e');
        }

        ctx.beginPath();
        ctx.fillStyle = gdt;
        ctx.strokeStyle = vm.borderColor;
        ctx.lineWidth = borderWidth;

        // draw the rounded top rectangle
        Chart.helpers.drawRoundedTopRectangle(ctx, left, (top - barRadius), barWidth, bottom - prevTop, barRadius);

        ctx.fill();
        if (borderWidth) {
          ctx.stroke();
        }

        // restore the original top value so tooltips and scales still work
        top = prevTop;
      }
    });

    Chart.defaults.roundedBar = Chart.helpers.clone(Chart.defaults.bar);
    // @ts-ignore
    Chart.defaults.global.datasets.roundedBar = Chart.defaults.global.datasets.bar;
    Chart.controllers.roundedBar = Chart.controllers.bar.extend({
      // draw() {
      //   // @ts-ignore
      //   Chart.controllers.bar.prototype.draw.call(this);
      //   const ctx = this.chart.ctx;
      //   const chartArea = this.chart.chartArea;
      //   const width = chartArea.right - chartArea.left;
      //   const height = chartArea.bottom - chartArea.top;
      //   Chart.helpers.drawRoundedTopRectangle(ctx, chartArea.left, chartArea.top, width, height, width/2);
      // }
      // @ts-ignore
      dataElementType: Chart.elements.RoundedTopRectangle
    });

    // console.log('Chart: ', Chart);
    // console.log('Chart defaults: ', Chart.defaults);
    // console.log('Chart controllers: ', Chart.controllers);
    // console.log('Chart controllers.bar: ', Chart.controllers.bar.prototype.draw);
    // console.log('Chart helpers: ', Chart.helpers);
    // // @ts-ignore
    // console.log('Chart elements: ', Chart.elements);
    // // @ts-ignore
    // console.log('Chart DatasetController: ', Chart.DatasetController);
    // Chart.helpers.roundedBar = Chart.helpers.bar;

    // @ts-ignore
    // Chart.elements.roundedBar = Chart.elements.bar;

    // @ts-ignore
    // const custom = Chart.DatasetController.extend(Chart.controllers.bar.prototype);

    // const custom = Chart.controllers.bar.extend({
      // linkScales: () => {
      //   console.log('link scales');
      // },
      // initialize: (chart, datasetIndex)  => {
      //   console.log('initialize');
      //   baseController.prototype.initialize.apply(this, arguments);
      // },
      // draw: (ease) => {
      //   console.log('drawing');
      //   baseController.prototype.draw.apply(this, arguments);
      // }
    // });

    // custom.linkScales = Chart.helpers.noop;

    // Chart.controllers.roundedBar = custom;

    this.myChart = new Chart('roundedBarChart', {
      type: 'roundedBar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', '1', '2', '3', '4', '5', '6'],
        datasets: [{
          label: '# of Votes',
          data: [3, 2, 1, 3, 6, 3, -3, 6, -1, -6, 5, 8],
          backgroundColor: gradient,
          borderColor: gradient,
          borderWidth: 0,
          // barThickness: 'flex',
          barPercentage: 0.5,
        },
        ]
      },
      options: {
        responsive: true,
        // @ts-ignore
        barRoundness: 1,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              display: false,
            },
            gridLines: {
              display: false,
            },
          }],
          xAxes: [{
            ticks: {
              display: false,
            },
            gridLines: {
              display: false,
            }
          }]
        },
        legend: {
          display: false,
        }
      }
    });

    // this.myChart = new Chart('chart', {
    //   type: 'bar',
    //   data: {
    //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //     datasets: [{
    //       label: '# of Votes',
    //       data: [12, 19, 3, -19 , 2, 3],
    //       backgroundColor: [
    //         'rgba(255, 99, 132, 0.2)',
    //         'rgba(54, 162, 235, 0.2)',
    //         'rgba(255, 206, 86, 0.2)',
    //         'rgba(75, 192, 192, 0.2)',
    //         'rgba(153, 102, 255, 0.2)',
    //         'rgba(255, 159, 64, 0.2)'
    //       ],
    //       // backgroundColor: gradient,
    //       borderColor: [
    //         'rgba(255, 99, 132, 1)',
    //         'rgba(54, 162, 235, 1)',
    //         'rgba(255, 206, 86, 1)',
    //         'rgba(75, 192, 192, 1)',
    //         'rgba(153, 102, 255, 1)',
    //         'rgba(255, 159, 64, 1)'
    //       ],
    //       // borderColor: gradient,
    //       borderWidth: 5,
    //       // barThickness: 'flex',
    //       // barPercentage: 0.5,
    //     },
    //      ]
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [{
    //         ticks: {
    //           beginAtZero: true
    //         }
    //       }]
    //     },
    //   }
    // });
  }

  /**
   * create gradient
   */
  createGradient(context: CanvasRenderingContext2D): CanvasGradient {
    const gradient = context.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#0086fb');
    gradient.addColorStop(0.5, '#50d3f2');
    gradient.addColorStop(0.5, '#d1d1d1');
    gradient.addColorStop(1, '#9e9e9e');
    return gradient;
  }
}
