class Beeswarm {
  /**
       * Class constructor with initial configuration
       * @param {Object}
       * @param {Array}
       */
  constructor(_config, allPreyGroups, dispatcher, selectedCat, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 550,
      tooltipPadding: 15,
      margin: {
        top: 30, right: 20, bottom: 30, left: 70,
      },
    };
    this.data = _data;
    this.selectedCat = selectedCat;
    this.dispatcher = dispatcher;
    this.allPreyGroups = allPreyGroups;
    this.selectedPreyCategories = allPreyGroups;
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
      .range([0, vis.width])
      .domain(d3.extent(vis.data, (d) => d['home-range']));

    vis.getAgeBin = (d) => {
      if (d <= 2) {
        return 0;
      } if (d <= 5) {
        return 3;
      } if (d <= 8) {
        return 6;
      }
      return 9;
    };

    vis.getBinFromLabel = (t) => {
      if (t === '0-2 years') {
        return 0;
      } if (t === '3-5 years') {
        return 3;
      } if (t === '6-8 years') {
        return 6;
      }
      return 9;
    };
    vis.yScale = d3.scaleBand()
      .range([0, vis.height - 50])
      .domain([0, 3, 6, 9])
      .paddingInner(0.55);

    vis.simulation = d3.forceSimulation(vis.data)
      .force('x', d3.forceX((d) => vis.xScale(d['home-range'])))
      .force('y', d3.forceY((d) => vis.yScale(vis.getAgeBin(d.age)) + (vis.yScale.bandwidth() / 2)))
      .force('collide', d3.forceCollide(5))
      .stop();

    for (let i = 0; i < vis.data.length; i++) {
      vis.simulation.tick();
    }

    vis.xAxisG = vis.chartArea.append('g')
      .attr('transform', `translate(0, ${vis.height - 20})`);
    vis.yAxisG = vis.chartArea.append('g')
      .attr('transform', 'translate(-0.5, 0)');

    vis.selectedBins = [0, 3, 6, 9];

    vis.svg.append('text')
      .text('Home Range Area (km\u00B2)')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('transform', `translate(${vis.width - 45}, ${vis.config.containerHeight - 13})`);

    vis.svg.append('text')
      .text('Age')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('transform', `translate(${vis.config.margin.left - 50},30)`);
    vis.shapeScale = d3.scaleOrdinal().domain(['Yes', 'No']).range(d3.symbols);
  }

  /**
       * Prepare the data and scales before we render it.
       */
  updateVis() {
    const vis = this;
    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickFormat(d3.format('.2f'))
      .tickValues([0.00, 0.01, 0.1, 1.0, 8.0])
      .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat((d, i) => ['0-2 years', '3-5 years', '6-8 years', '9+ years'][i])
      .tickSizeOuter(0)
      .tickSize(-vis.width);

    vis.renderVis();
  }

  /**
         * Bind data to visual elements (enter-update-exit) and update axes
         */
  renderVis() {
    const vis = this;

    vis.xAxisG.call(vis.xAxis);

    const yAxisCall = vis.yAxisG.call(vis.yAxis);
    yAxisCall.select('.domain').attr('d', `M0.5,0.5V${(vis.height - 20).toString()}.5`);
    yAxisCall.selectAll('.tick').classed('y-axis', true);

    vis.yAxisG.selectAll('.tick text')
      .on('click', function (d) {
        const selected = d3.select(this).classed('selected');
        d3.selectAll('.tick text').classed('selected', false);
        d3.select(this).classed('selected', !selected);
        vis.selectedPreyCategories = vis.allPreyGroups;
        if (!selected) {
          const bin = vis.getBinFromLabel(d.target.textContent);
          vis.selectedBins = [bin];
          d3.selectAll('.point').classed('included', (d) => vis.getAgeBin(d.age) === bin);
          d3.selectAll('.point').classed('selected', (d) => {
            if (vis.getAgeBin(d.age) === bin && vis.selectedCat === d['unique-id']) {
              return true;
            } if (vis.selectedCat === d['unique-id']) {
              vis.selectedCat = 'none';
              return false;
            }
            return false;
          });
          vis.dispatcher.call('selectedAgeCat', this, bin);
        } else {
          d3.selectAll('.point').classed('included', true);
          vis.selectedBins = vis.allPreyGroups;
          vis.dispatcher.call('selectedAgeCat', this, null);
        }
      });

    const cells = vis.chartArea.selectAll('.point')
      .data(vis.data)
      .join('path')
      .classed('point', true)
      .classed('included', (d) => vis.selectedPreyCategories.includes(d.prey_p_month) && vis.selectedBins.includes(vis.getAgeBin(d.age)))
      .classed('selected', (d) => {
        if (vis.selectedCat === d['unique-id'] && vis.selectedPreyCategories.includes(d.prey_p_month)) {
          return true;
        } if (vis.selectedCat === d['unique-id']) {
          vis.selectedCat = 'none';
          return false;
        }
        return false;
      })
      .classed('male', ((d) => d.sex === 'Male'))
      .classed('female', ((d) => d.sex === 'Female'))
      .classed('unk', ((d) => d.sex === 'Unk'))
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('d', d3.symbol(d3.symbolCircle).size(50))
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
      })
      .on('click', function () {
        if (d3.select(this).classed('included')) {
          d3.selectAll('.point').classed('selected', false);
          d3.select(this).classed('selected', true);
          vis.selectedCat = d3.select(this).data()[0]['unique-id'];
          vis.dispatcher.call('selectedCat', this, vis.selectedCat);
        }
      });
  }
}
