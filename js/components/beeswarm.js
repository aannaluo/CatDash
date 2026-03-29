class Beeswarm {
  /**
       * Class constructor with initial configuration
       * @param {Object}
       * @param {Array}
       */
  constructor(_config, selectedPreyCategories, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 490,
      containerHeight: 120,
      tooltipPadding: 15,
      margin: {
        top: 10, right: 20, bottom: 10, left: 20,
      },
    };
    this.data = _data;
    this.selectedPreyCategories = selectedPreyCategories;
    this.initVis();
  }

  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Append svg
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append chart container (svg size - margins)
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Set x scale
    vis.xScale = d3.scaleLog()
      .range([0, vis.width]);

          // Set dynamic x domain
    vis.xScale
      .domain([0.002, 2.239]);

    vis.simulation = d3.forceSimulation(vis.data)
      .force('x', d3.forceX((d) => vis.xScale(d['home-range'])))
      .force('y', d3.forceY(vis.height / 2))
      // .force('charge', d3.forceManyBody().strength(-1))
      .force('collide', d3.forceCollide(5))
      .stop();

    for (let i = 0; i < vis.data.length; i++) {
      vis.simulation.tick();
    }

    vis.xAxisG = vis.chartArea.append('g');
  }

  /**
       * Prepare the data and scales before we render it.
       */
  updateVis() {
    const vis = this;
    console.log(vis.selectedPreyCategories);

    // const maxAge = d3.max(vis.data, (d) => d.Age);
    // const maxHR = d3.max(vis.data, (d) => d['Home Range Area (km2)']);
    // vis.xScale
    //   .domain([0, maxAge]);
    // vis.yScale
    //   .domain([maxHR, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale);
    // vis.yAxis = d3.axisLeft(vis.yScale);
    vis.renderVis();
  }

  /**
         * Bind data to visual elements (enter-update-exit) and update axes
         */
  renderVis() {
    const vis = this;

    const cells = vis.chartArea.selectAll('circle')
      .data(vis.data)
      .join('circle')
      .classed('included', (d) => vis.selectedPreyCategories.includes(d.prey_p_month))
      .classed('male', ((d) => d.sex === 'Female'))
      .classed('female', ((d) => d.sex === 'Male'))
      .classed('unk', ((d) => d.sex === 'Unk'))
      .attr('r', 3.75)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .on('mouseover', function (event, d) {
        if (d3.select(this).classed('included')) {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
            .style('top', `${event.pageY + vis.config.tooltipPadding}px`)
            .html(`<div class="tooltip-label">${d['animal-name']}</div><div>Location: ${d['study-site']}</div><div>Home Range: ${d['home-range']}</div>`);
        }
      })
      .on('mouseout', function () {
        if (d3.select(this).classed('included')) {
          d3.select('#tooltip')
            .style('display', 'none');
        }
      });

    // vis.cell.append('path')
    //   .attr('d', (d) => `M${d.join('L')}Z`);
  }
}
