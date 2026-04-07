class BarChart {
  /**
     * Class constructor with initial configuration
     * @param {Object}
     */
  constructor(_config, dispatcher, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 550,
      containerHeight: 250,
      margin: {
        top: 30,
        right: 20,
        bottom: 30,
        left: 70,
      },
    };
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
      .attr('id', 'bar-chart')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'axis y-axis');

    // vis.title = vis.svg.append('text')
    //   .style('text-anchor', 'start')
    //   .attr('x', 5)
    //   .attr('y', 10)
    //   .attr('dy', '.71em')
    //   .text('Prey per Month')
    //   .style('font-weight', 'bold');

    vis.svg.append('text')
      .text('Prey caught per month')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .attr('transform', `translate(${vis.width / 2 - vis.config.margin.left + 70}, 10)`);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    const tickLabels = ['None', '1-4', '5-9', '10-19', '20+'];

    vis.xScale = d3.scaleBand()
      .domain([0, 1, 5, 10, 20])
      .range([0, vis.width])
      .paddingInner(0.1);

    vis.yScale = d3.scaleLinear()
      .range([0, vis.height])
      .domain([d3.max(vis.data, (d) => d.length), 0]);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0)
      .tickSize(0)
      .tickFormat((d, i) => tickLabels[i]);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSizeOuter(0);

    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis)
      .select('.domain')
      .style('stroke', 'rgb(208, 207, 207)');

    vis.yAxisG.call(vis.yAxis)
      .select('.domain')
      .style('stroke', 'rgb(208, 207, 207)');

    vis.chartArea.selectAll('.bar')
      .data(vis.data, (d) => d.x1)
      .join('rect')
      .attr('class', 'bar')
      .attr('width', vis.xScale.bandwidth())
      .attr('height', (d) => vis.height - vis.yScale(d.length))
      .attr('x', (d) => vis.xScale(d.x0))
      .attr('y', (d) => vis.yScale(d.length))
      .on('click', function handleBarClick() {
        const selected = d3.select(this).classed('selected');
        d3.select(this).classed('selected', !selected);
        const selectedPreyCategories = d3.selectAll('.bar.selected').data().map((d) => [d.x0, d.x1]);
        vis.dispatcher.call('selectedPreyCats', this, selectedPreyCategories);
      });
  }
}
