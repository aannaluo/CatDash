class RadialChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 200,
      containerHeight: 240,
      maxWidth: 200,
      maxHeight: 240,
      margin: {
        top: 5, right: 5, bottom: 5, left: 5,
      },
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    vis.innerRadius = 30;
    vis.outerRadius = Math.min(vis.config.containerWidth, vis.config.containerHeight) / 2;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr(
        'transform',
        `translate(${vis.config.containerWidth / 2},${vis.config.containerHeight / 2})`,
      );

    vis.xScale = d3.scaleBand()
      .domain(d3.range(24))
      .range([0, 2 * Math.PI])
      .align(0);

    vis.yScale = d3.scaleRadial()
      .range([vis.innerRadius, vis.outerRadius]);

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'radial-axis x-axis');

    vis.yAxisG = vis.chartArea.append('g');
    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    vis.yScale.domain([0, d3.max(vis.data, (d) => d.distance_p_hour)]);
    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    vis.chartArea
      .selectAll('path.bar')
      .data(vis.data, (d) => d.curr_hour)
      .join('path')
      .attr('class', 'radial-bar')
      .attr('fill', '#EEC084')
      .attr('d', d3.arc()
        .innerRadius(vis.innerRadius)
        .outerRadius((d) => vis.yScale(d.distance_p_hour))
        .startAngle((d) => vis.xScale(d.curr_hour))
        .endAngle((d) => vis.xScale(d.curr_hour) + vis.xScale.bandwidth())
        .padAngle(0.01)
        .padRadius(vis.innerRadius));

    // Add hour labels
    vis.chartArea.selectAll('text.hour-label')
      .data(vis.data)
      .join('text')
      .attr('class', 'hour-label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('x', (d) => {
        const angle = vis.xScale(d.curr_hour) + vis.xScale.bandwidth() / 2 - Math.PI / 2;
        return Math.cos(angle) * (vis.innerRadius + 15);
      })
      .attr('y', (d) => {
        const angle = vis.xScale(d.curr_hour) + vis.xScale.bandwidth() / 2 - Math.PI / 2;
        return Math.sin(angle) * (vis.innerRadius + 15);
      })
      .text((d) => d.curr_hour);

    vis.yTicks = vis.yScale.ticks(3);

    vis.chartArea.selectAll('.y-grid')
      .data(vis.yTicks)
      .join('circle')
      .attr('class', 'y-grid')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('r', (d) => vis.yScale(d));

    vis.chartArea.selectAll('.y-axis-label')
      .data(vis.yTicks.filter((d) => d !== 0)) // add this filter
      .join('text')
      .attr('class', 'y-axis-label')
      .attr('x', 0)
      .attr('y', (d) => -vis.yScale(d))
      .attr('dy', '-0.3em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => `${d / 1000}km`);
  }
}
