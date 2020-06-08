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
    Chart.helpers.drawRoundedTopRectangle = (ctx, x, y, width, height, radius) => {
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

        if (!vm.horizontal) {
          // bar
          left = vm.x - vm.width / 2;
          right = vm.x + vm.width / 2;
          top = vm.y;
          bottom = vm.base;
          signX = 1;
          signY = bottom > top ? 1 : -1;
          borderSkipped = vm.borderSkipped || 'bottom';
        } else {
          // horizontal bar
          left = vm.base;
          right = vm.x;
          top = vm.y - vm.height / 2;
          bottom = vm.y + vm.height / 2;
          signX = right > left ? 1 : -1;
          signY = 1;
          borderSkipped = vm.borderSkipped || 'left';
        }

        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (borderWidth) {
          // borderWidth shold be less than bar width and bar height.
          const barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
          borderWidth = borderWidth > barSize ? barSize : borderWidth;
          const halfStroke = borderWidth / 2;
          // Adjust borderWidth when bar top position is near vm.base(zero).
          const borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
          const borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
          const borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
          const borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
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
      // @ts-ignore
      dataElementType: Chart.elements.RoundedTopRectangle
    });

    this.myChart = new Chart('roundedBarChart', {
      type: 'roundedBar',
      data: {
        labels: ['Apr 2019', 'May 2019', 'Jun 2019', 'Jul 2019', 'Aug 2019', 'Sep 2019',
          'Oct 2019', 'Nov 2019', 'Dec 2019', 'Jan 2020', 'Feb 2020', 'Mar 2020'],
        datasets: [
          {
            label: 'Label',
            data: [3, 2, 4, 3, 6, 3, -3, 6, -1, -6, 5, 8],
            borderWidth: 0,
            // barThickness: 'flex',
            barPercentage: 0.5,
          },
          {
            label: 'line at the ends',
            data: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12],
            type: 'bar',
            barThickness: 2,
            borderWidth: 0,
            backgroundColor: '#0086fb',
          }
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
            position: 'top',
            ticks: {
              callback: (item, index) => {
                if (index === 0) {
                  return item;
                }
                if (index === 10) {
                  return 'Today';
                }
              },
              fontSize: 15,
              display: true,
              padding: -40,
              labelOffset: 45,
            },
            gridLines: {
              display: false,
            },
          }]
        },
        legend: {
          display: false,
        },
      }
    });
  }
}
