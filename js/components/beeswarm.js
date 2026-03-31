class Beeswarm {
  /**
       * Class constructor with initial configuration
       * @param {Object}
       * @param {Array}
       */
  constructor(_config, selectedPreyCategories, dispatcher, selectedCat, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 600,
      tooltipPadding: 15,
      margin: {
        top: 30, right: 30, bottom: 30, left: 90,
      },
    };
    this.data = _data;
    this.selectedCat = selectedCat;
    this.dispatcher = dispatcher;
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
      .range([0, vis.width])
      .domain(d3.extent(vis.data, (d) => d['home-range']));

    vis.getBin = (d) => {
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
      .paddingInner(0.5);

    vis.simulation = d3.forceSimulation(vis.data)
      .force('x', d3.forceX((d) => vis.xScale(d['home-range'])))
      .force('y', d3.forceY((d) => vis.yScale(vis.getBin(d.age)) + (vis.yScale.bandwidth() / 2)))
      .force('collide', d3.forceCollide(5))
      .stop();

    for (let i = 0; i < vis.data.length; i++) {
      vis.simulation.tick();
    }

    vis.xAxisG = vis.chartArea.append('g')
      .attr('transform', `translate(0, ${vis.height - 20})`);
    vis.yAxisG = vis.chartArea.append('g');

    vis.selectedBins = [0, 3, 6, 9];
  }

  /**
       * Prepare the data and scales before we render it.
       */
  updateVis() {
    const vis = this;
    console.log(vis.selectedPreyCategories);

    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat((d, i) => ['0-2 years', '3-5 years', '6-8 years', '9+ years'][i]);
    vis.renderVis();
  }

  /**
         * Bind data to visual elements (enter-update-exit) and update axes
         */
  renderVis() {
    const vis = this;

    vis.yAxisG.call(vis.yAxis)
      .select('.domain').remove();

    vis.xAxisG.call(vis.xAxis);

    vis.yAxisG.selectAll('.tick text')
      .on('click', function (d) {
        const selected = d3.select(this).classed('selected');
        d3.selectAll('.tick text').classed('selected', false);
        d3.select(this).classed('selected', !selected);
        if (!selected) {
          console.log(d.target.textContent);
          const bin = vis.getBinFromLabel(d.target.textContent);
          console.log(bin);
          vis.selectedBins = [bin];
          d3.selectAll('circle').classed('included', (d) => vis.getBin(d.age) === bin);
          d3.selectAll('circle').classed('selected', (d) => {
            if (vis.getBin(d.age) === bin && vis.selectedCat === d['unique-id']) {
              return true;
            }
            vis.selectedCat = 'none';
            return false;
          });
          vis.dispatcher.call('selectedAgeCat', this, bin);
        } else {
          d3.selectAll('circle').classed('included', true);
          vis.selectedBins = [0, 3, 6, 9];
          vis.dispatcher.call('selectedAgeCat', this, null);
        }
      });

    const cells = vis.chartArea.selectAll('circle')
      .data(vis.data)
      .join('circle')
      .classed('point', true)
      .classed('included', (d) => vis.selectedPreyCategories.includes(d.prey_p_month) && vis.selectedBins.includes(vis.getBin(d.age)))
      .classed('selected', (d) => vis.selectedCat === d['unique-id'])
      .classed('male', ((d) => d.sex === 'Male'))
      .classed('female', ((d) => d.sex === 'Female'))
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
      })
      .on('click', function () {
        d3.selectAll('circle').classed('selected', false);
        d3.select(this).classed('selected', true);
        vis.selectedCat = d3.select(this).data()[0]['unique-id'];
        vis.dispatcher.call('selectedCat', this, vis.selectedCat);
      });
  }
}
