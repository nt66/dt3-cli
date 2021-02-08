import React, { Component } from 'react';
import * as d3 from 'd3';
import isEqual from 'lodash/isEqual';
import './index.less';

export default class Radar extends Component {
  componentDidMount() {
    this.drawChart();
  }
  componentDidUpdate(preProps) {
    if (
      preProps.centerPosition !== this.props.centerPosition ||
      !isEqual(preProps.data, this.props.data)
    ) {
      this.drawChart();
    }
  }
  drawChart() {
    const { opts, data, tag, type, centerPosition, centerScore } = this.props;
    const { width = 385, height = 303, showTrend } = opts || {};
    let svg;
    if (tag === 'g') {
      svg = d3.select(this.container);
      // svg.selectAll('.main, defs').remove();
    } else {
      // 创建svg
      d3.select(this.container)
        .select('#main')
        .remove();
      svg = d3
        .select(this.container)
        .append('svg')
        .attr('id', 'main')
        .attr('width', width)
        .attr('height', height);
    }

    // 创建根容器
    const main = svg
      .append('g')
      .attr('transform', centerPosition || `translate(${width / 2 + 18},${height / 2})`);

    // 计算网坐标
    const radius = width * 0.27; // 110
    const total = 6;
    const level = 4;
    const rangeMin = 0;
    const rangeMax = width * 0.27;
    const arc = 2 * Math.PI;
    const onePiece = arc / total;
    const polygons = {
      webs: [],
      webPoints: [],
    };
    for (let k = level; k > 0; k -= 1) {
      let webs = '';
      const webPoints = [];
      const r = (radius / level) * k;
      for (let i = 0; i < total; i += 1) {
        const x = r * Math.sin(i * onePiece);
        const y = r * Math.cos(i * onePiece);
        webs += `${x},${y} `;
        webPoints.push({
          x,
          y,
        });
      }
      polygons.webs.push(webs);
      polygons.webPoints.push(webPoints);
    }

    // 绘制多边形
    const webs = main.append('g');
    //.classed('webs', true);

    webs
      .selectAll('polygon')
      .data(polygons.webs)
      .enter()
      .append('polygon')
      .attr('stroke', '#46d2f4')
      .attr('stroke-width', 5)
      .attr('stroke-opacity', 0.2)
      .attr('points', d => d);

    // 添加纵轴
    const lines = main.append('g').classed('lines', true);
    lines
      .selectAll('line')
      .data(polygons.webPoints[0])
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', d => {
        return d.x;
      })
      .attr('y2', d => {
        return d.y;
      });

    const trendValue = data.map(e => {
      return Number(e.trend);
    });
    const values = data.map(e => {
      return Number(e.value);
    });
    // 计算文字标签坐标
    const textPoints = [];
    const textRadius = radius + 35;
    for (let i = 0; i < total; i += 1) {
      const x = textRadius * Math.sin(i * onePiece);
      let y = textRadius * Math.cos(i * onePiece);
      if (i === 0) {
        y = textRadius * Math.cos(i * onePiece) - 10;
      } else if (i === 3) {
        y = textRadius * Math.cos(i * onePiece) + 20;
      }
      textPoints.push({
        x,
        y,
        trend: trendValue[i],
        value: values[i],
      });
    }

    // 计算雷达图表的坐标
    const areasData = [];

    for (let i = 0; i < values.length; i += 1) {
      // var value = values[i],
      let area = '';
      const points = [];
      for (let k = 0; k < total; k += 1) {
        const r = (radius * (values[k] - rangeMin)) / (rangeMax - rangeMin);
        const x = r * Math.sin(k * onePiece);
        const y = r * Math.cos(k * onePiece);
        area += `${x},${y} `;
        points.push({
          x,
          y,
        });
      }
      areasData.push({
        polygon: area,
        points,
      });
    }

    // 添加g分组包含所有雷达图区域
    const areas = main.append('g').classed('areas', true);
    // 添加g分组用来包含一个雷达图区域下的多边形以及圆点
    areas
      .selectAll('g')
      .data(areasData)
      .enter()
      .append('g')
      .attr('class', (d, i) => {
        return `area${i + 1}`;
      });
    const defs = svg.append('defs');
    const linearGradient = [
      { offset: '0', color: '#007ACC', opacity: 1 },
      { offset: '100%', color: '#46D2F4', opacity: 1 },
    ];
    defs
      .append('linearGradient')
      .attr('id', 'polyon-gra1')
      .attr('x1', '100%')
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', '100%')
      .selectAll('stop')
      .data(linearGradient)
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
      .attr('stop-opacity', d => d.opacity);

    for (let i = 0; i < areasData.length; i += 1) {
      // 依次循环每个雷达图区域
      const area = areas.select(`.area${i + 1}`);
      const areaData = areasData[i];
      // 绘制雷达图区域下的多边形
      area
        .append('polygon')
        .attr('points', areaData.polygon)
        .attr('fill', 'url(#polyon-gra1)')
        .attr('opacity', 0.3);

      // 绘制雷达图区域下的点
      const circles = area.append('g').classed('circles', true);
      circles
        .selectAll('circle')
        .data(areaData.points)
        .enter()
        .append('circle')
        .attr('cx', d => {
          return d.x;
        })
        .attr('cy', d => {
          return d.y;
        })
        .attr('r', 4)
        .attr('stroke', '#46D2F4')
        .attr('stroke-width', 2);
    }

    // 平均值线

    const avgData = {
      webs: [],
      webPoints: [],
    };
    const avgValue = data.map(e => {
      return Number(e.avg);
    });
    let textX = 0;
    let textY = 0;
    for (let i = 0; i < avgValue.length; i += 1) {
      let avgwebs = '';
      const webPoints = [];
      for (let k = 0; k < total; k += 1) {
        const r = (radius * (avgValue[k] - rangeMin)) / (rangeMax - rangeMin);
        const x = r * Math.sin(k * onePiece);
        const y = r * Math.cos(k * onePiece);
        // console.log('2222',x,y);
        // if (!this.isNum(x) && !this.isNum(y)) {
        if (x ** 2 + y ** 2 - (textX ** 2 + textX ** 2) > 0) {
          textX = x;
          textY = y;
        }
        avgwebs += `${x},${y} `;
        webPoints.push({
          x,
          y,
        });
        // }
      }
      avgData.webs.push(avgwebs);
      avgData.webPoints.push(webPoints);
    }
    // console.log('122222', avgData)
    if (avgData.webs.length > 1) {
      const avglines = main.append('g').classed('avglines', true);
      avglines
        .selectAll('polygon')
        .data(avgData.webs)
        .enter()
        .append('polygon')
        .attr('points', d => d);

      const avgcircles = main.append('g').classed('avgcircles', true);
      avgcircles
        .selectAll('text')
        .data([null])
        .enter()
        .append('text')
        .attr('font-size', 14)
        .attr('fill', '#FFF171')
        .attr('fill-opacity', 0.75)
        .attr('x', textX)
        .attr('y', textY)
        .attr('dx', '.5em')
        .attr('dy', '-.5em')
        .text(() => (textX * textX + textY * textY === 0 ? '' : '平均线'));

      avgcircles
        .selectAll('circle')
        .data(avgData.webPoints[0])
        .enter()
        .append('circle')
        .attr('cx', d => {
          return d.x;
        })
        .attr('cy', d => {
          return d.y;
        })
        .attr('r', 4)
        .attr('stroke', '#FFF171')
        .attr('opacity', '0.86')
        .attr('stroke-width', 2);
    }

    // 绘制文字名称
    const texts = main.append('g').classed('texts', true);
    texts
      .selectAll('text')
      .data(textPoints)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('dx', (_, i) => (i === 0 || i === 3 ? '-1em' : '0'))
      .text((d, i) => {
        return data[i].name;
      });

    // 绘制文字数量
    const nums = main.append('g').classed('num', true);
    nums
      .selectAll('text')
      .data(textPoints)
      .enter()
      .append('text')
      .attr('dx', (_, i) => (i === 0 || i === 3 ? '10' : '0'))
      .attr('dy', (_, i) => (i === 0 || i === 3 ? '0' : '22'))
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', (_, i) => {
        const isMiddle = i === 0 || i === 3;
        if (isMiddle) {
          return 'start';
        }
        return showTrend ? 'end' : 'middle';
      })
      .attr('fill', d => (d.value >= 60 ? '#4FE2C1' : '#F8811C'))
      .text(d => d.value);

    const getIconTrend = size => {
      if (size > 0) {
        return '/images/up.svg';
      }
      if (size < 0) {
        return '/images/down.svg';
      }
      return '/images/flat.svg';
    };

    if (showTrend) {
      const trend = main.append('g').classed('trend', true);
      trend
        .selectAll('image')
        .data(textPoints)
        .enter()
        .append('image')
        .attr('x', (d, i) =>
          i === 0 || i === 3 ? d.x + 10 + `${d.value || '0'}`.length * 12 : d.x + 2
        )
        .attr('y', (d, i) => (i === 0 || i === 3 ? d.y - 14 : d.y + 7))
        .attr('width', 16)
        .attr('height', 16)
        .attr('href', d => getIconTrend(d.trend));
    }

    // 绘制tips
    if (type !== 'quality') {
      const tips = d3.select(this.containerTip);
      const score = centerScore || parseInt(values.reduce((a, b) => a + b) / values.length, 10);
      tips
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .classed('main', true)
        .attr('transform', centerPosition || `translate(${width / 2 + 18},${height / 2})`);
      tips.attr('transform', `translate(18,0) scale(0.2,0.2)`);
      const covers = main.append('g').classed('covers', true);
      covers.append('polygon').attr('points', () => {
        return polygons.webs.slice(-1);
      });
      covers
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('y', () => {
          return 8;
        })
        .attr('fill', () => (score >= 60 ? '#4FE2C1' : '#F8811C'))
        .text(() => score);
      // }
    } else {
      d3.selectAll('.svg-tip-text').remove();

      const tips = d3.select(this.containerTip);
      const score = centerScore || parseInt(values.reduce((a, b) => a + b) / values.length, 10);
      const colors = score > 60 ? '#4FE2C1' : '#F8811C';
      // console.log('score', score);
      tips
        .attr('width', width)
        .attr('height', height)
        .append('text')
        .attr('class', 'svg-tip-text')
        .attr('font-size', '48px')
        .attr('fill', colors)
        .attr('dx', '-.1em')
        .attr('font-weigth', 700)
        .attr('transform', score === 0 ? 'translate(230,130)' : 'translate(215,130)')
        .text(() => {
          return score === 0 ? '-' : score;
        });
    }
  }
  render() {
    const { opts, data, tag, title } = this.props;
    // Tag增加支持直接返回g元素可以直接用于svg中
    const Tag = tag || 'div';
    this.options = opts || {};
    this.defaultData = data || [];
    return (
      <Tag
        className="raderChart"
        ref={node => {
          this.container = node;
        }}
      >
      </Tag>
    );
  }
}