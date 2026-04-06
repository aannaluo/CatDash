class LineChart {
  /**
       * Class constructor with initial configuration
       * @param {Object}
       */
  constructor(_config, dispatcher, selectedCat, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 250,
      margin: {
        top: 40,
        right: 30,
        bottom: 30,
        left: 60,
      },
    };
    this.selectedCat = selectedCat;
    this.dispatcher = dispatcher;
    this.data = data;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('id', 'line-chart')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'axis y-axis');

    vis.line = vis.chartArea.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 2);

    vis.svg.append('text')
      .text('Date')
      .style('font-size', '12px')
      .style('font-weight', 'bold');
    //   .attr('transform', `translate(${vis.width + 35}, ${vis.config.containerHeight-5})`);

    vis.svg.append('text')
      .text('Distance from start point (km)')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('transform', `translate(${vis.config.margin.left - 50}, 30)`);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.selectedCatData = vis.data.filter((d) => d.unique_id === vis.selectedCat);
    console.log(d3.max(vis.selectedCatData, (d) => parseFloat(d.dist_from_start)));

    const uniqueDays = new Set(vis.selectedCatData.map((d) => d3.timeDay.floor(d.timestamp).getTime())).size;
    const tickInterval = () => {
      if (uniqueDays > 10 && uniqueDays <= 20) {
        return d3.timeDay.every(2);
      } if (uniqueDays > 20 && uniqueDays <= 50) {
        return d3.timeDay.every(5);
      } if (uniqueDays > 50) {
        return d3.timeDay.every(50);
      }
      return d3.timeDay.every(1);
    };

    vis.xScale = d3.scaleTime()
      .domain(d3.extent(vis.selectedCatData, (d) => d.timestamp))
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .domain([d3.max(vis.selectedCatData, (d) => parseFloat(d.dist_from_start)), 0])
      .range([0, vis.height]);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(tickInterval())
      .tickFormat(d3.timeFormat('%b-%d'))
      .tickSize(-vis.height)
      .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSizeOuter(0);

    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    const lineFunc = d3.line()
      .x((d) => vis.xScale(d.timestamp))
      .y((d) => vis.yScale(parseFloat(d.dist_from_start)));

    vis.line.attr('d', lineFunc(vis.selectedCatData));

    // vis.chartArea.selectAll('.line-chart-point')
    //   .data(vis.selectedCatData)
    //   .join('circle')
    //   .attr('class', 'line-chart-point')
    //   .attr('cx', (d) => vis.xScale(d.timestamp))
    //   .attr('cy', (d) => vis.yScale(parseFloat(d.dist_from_start)))
    //   .style('fill', 'steelblue')
    //   .attr('r', 2); // Radius of the point
    // vis.chartArea.selectAll('.line')
    //   .data(vis.selectedCatData)
    //   .join('path')
    //   .attr('class', 'line')
    //   .attr('fill', 'none')
    //   .attr('stroke', 'steelblue')
    //   .attr('stroke-width', 1.5)
    //   .attr('d', d3.line()
    //     .x((d) => vis.xScale(d.timestamp))
    //     .y((d) => vis.yScale(d.dist_from_start)));
  }
}
