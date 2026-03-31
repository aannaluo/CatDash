class BarChart {
  /**
     * Class constructor with initial configuration
     * @param {Object}
     */
  constructor(_config, dispatcher, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 490,
      containerHeight: 240,
      margin: {
        top: 50,
        right: 30,
        bottom: 20,
        left: 30,
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

    vis.yAxisTitle = vis.svg.append('text')
      .style('text-anchor', 'start')
      .attr('x', 5)
      .attr('y', 10)
      .attr('dy', '.71em')
      .text('Prey per Month')
      .style('font-weight', 'bold');

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const counts = d3.rollups(vis.data, (v) => v.length, (d) => d.prey_p_month);
    vis.preyCount = counts.map((d) => {
      d[0] = +d[0];
      return d;
    });

    vis.xScale = d3.scaleBand()
      .domain(d3.range(d3.extent(vis.preyCount, (d) => d[0])[1] + 1))
      .range([0, vis.width])
      .paddingInner(0.1);

    vis.yScale = d3.scaleLinear()
      .range([0, vis.height])
      .domain([d3.max(vis.preyCount, (d) => d[1]), 0]);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0);


    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(5)
      .tickSizeOuter(0);

    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis)

    vis.yAxisG.call(vis.yAxis)

    const bars = vis.chartArea.selectAll('.bar')
      .data(vis.preyCount, (d) => d[0])
      .join('rect')
      .attr('class', 'bar')
      .attr('width', vis.xScale.bandwidth())
      .attr('height', (d) => vis.height - vis.yScale(d[1]))
      .attr('x', (d) => vis.xScale(d[0]))
      .attr('y', (d) => vis.yScale(d[1]))
      .on('click', function () {
        const selected = d3.select(this).classed('selected');
        d3.select(this).classed('selected', !selected);
        const selectedPreyCategories = d3.selectAll('.bar.selected').data().map((d) => d[0]);
        vis.dispatcher.call('selectedPreyCats', this, selectedPreyCategories);
      });
  }
}
