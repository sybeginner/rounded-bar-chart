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
    };
    //
    // // @ts-ignore
    // Chart.elements.RoundedTopRectangle = Chart.elements.Rectangle.extend({
    //   draw: () => {
    //     const ctx = <Chart>this
    //   }
    // });
    //
    Chart.defaults.roundedBar = Chart.helpers.clone(Chart.defaults.bar);
    // @ts-ignore
    Chart.defaults.global.datasets.roundedBar = Chart.defaults.global.datasets.bar;
    Chart.controllers.roundedBar = Chart.controllers.bar.extend({
      draw(ease) {
        // @ts-ignore
        Chart.controllers.bar.prototype.draw.call(this, ease);
        console.log('custom');
        Chart.helpers.drawRoundedTopRectangle(this.chart.chart.ctx, 100, 100, 50, 200, 25);
      }
      // @ts-ignore
      // dataElementType: Chart.elements.RoundedTopRectangle
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
    Chart.helpers.roundedBar = Chart.helpers.bar;

    // @ts-ignore
    Chart.elements.roundedBar = Chart.elements.bar;

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
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, -19 , 2, 3],
          backgroundColor: gradient,
          borderColor: gradient,
          borderWidth: 5,
          barThickness: 'flex',
          barPercentage: 0.5,
        },
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
      }
    });

    this.myChart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, -19 , 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          // backgroundColor: gradient,
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          // borderColor: gradient,
          borderWidth: 5,
          // barThickness: 'flex',
          // barPercentage: 0.5,
        },
         ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
      }
    });
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
