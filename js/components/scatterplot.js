// window.renderScatterplot = () => '<h2>Hello</h2><script>new Timeline().renderVis() </script>';

// eslint-disable-next-line no-unused-vars
class Scatterplot {
  /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 650,
      containerHeight: 310,
      tooltipPadding: 15,
      margin: {
        top: 80, right: 20, bottom: 20, left: 45,
      },
      legendWidth: 170,
      legendHeight: 8,
      legendRadius: 5,
    };
    this.data = _data;
    this.selectedCategories = [];
    this.initVis();
  }

  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xScale = d3.scaleLinear()
      .range([50, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([0, (vis.height - 10)]);

    vis.xAxisG = vis.chartArea.append('g');
    vis.yAxisG = vis.chartArea.append('g');

    vis.updateVis();
  }

  /**
     * Prepare the data and scales before we render it.
     */
  updateVis() {
    const vis = this;
    const maxAge = d3.max(vis.data, (d) => d.Age);
    const maxHR = d3.max(vis.data, (d) => d['Home Range Area (km2)']);
    vis.xScale
      .domain([0, maxAge]);
    vis.yScale
      .domain([maxHR, 0]);
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);
    vis.xAxisG = vis.chartArea.append('g');
    vis.yAxisG = vis.chartArea.append('g');
    vis.renderVis();
  }

  /**
       * Bind data to visual elements (enter-update-exit) and update axes
       */
  renderVis() {
    const vis = this;

    vis.yAxisG
      .call(vis.yAxis)
      .attr('class', 'yaxis')
      .attr('transform', 'translate(50, 0)');

    vis.xAxisG
      .call(vis.xAxis)
      .attr('class', 'xaxis')
      .attr('transform', `translate(0, ${vis.height - 10})`);

    const catGroupNeutered = vis.chartArea.selectAll('.splot-point')
      .data(vis.data.filter((d) => d.Neutered === 'Yes'), (d) => d[0]);

    const catGroupNeuteredAdded = catGroupNeutered.enter()
      .append('circle')
      .attr('class', 'splot-point')
      .attr('r', 4)
      .attr('fill', (d) => {
        if (d.Sex === 'Female') {
          return '#ff88c4';
        }
        return '#0095da';
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.3);

    catGroupNeuteredAdded.merge(catGroupNeutered)
      .attr('cx', (d) => `${vis.xScale(d.Age)}`)
      .attr('cy', (d) => `${vis.yScale(d['Home Range Area (km2)'])}`);

    catGroupNeutered.exit().remove();

    const catGroupNotNeutered = vis.chartArea.selectAll('.splot-point-square')
      .data(vis.data.filter((d) => d.Neutered === 'No'), (d) => d[0]);

    const catGroupNotNeuteredAdded = catGroupNotNeutered.enter()
      .append('rect')
      .attr('class', 'splot-point-square')
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', (d) => {
        if (d.Sex === 'Female') {
          return '#ff88c4';
        }
        return '#0095da';
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.3);

    catGroupNotNeuteredAdded.merge(catGroupNotNeutered)
      .attr('x', (d) => `${vis.xScale(d.Age)}`)
      .attr('y', (d) => `${vis.yScale(d['Home Range Area (km2)'])}`);

    catGroupNotNeutered.exit().remove();

    vis.svg.append('text')
      .attr('transform', `translate(${(vis.width + 50) / 2}, ${vis.height + vis.config.margin.top + 17})`)
    //   .attr('x', vis.width / 2)
    //   .attr('y', vis.height + vis.config.margin.top)
      .text('Age (years)')
      .attr('font-size', '0.8em');

    vis.svg.append('text')
      .attr('transform', 'rotate(-90) translate(-230, 50)')
    //   .attr('x', vis.width / 2)
    //   .attr('y', vis.height + vis.config.margin.top)
      .text('Home Range (km^2)')
      .attr('font-size', '0.8em');
  }
}
