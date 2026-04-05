class HeatMap {
  constructor(_config, _data, _radialData, _catData, dispatcher, selectedCat) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 450,
      containerHeight: 700,
      margin: {
        top: 30, right: 20, bottom: 20, left: 20,
      },
    };
    this.data = _data;
    this.radialData = _radialData;
    this.catData = _catData;
    this.dispatcher = dispatcher;
    this.selectedCat = selectedCat;
    this.initVis();
  }

  initVis() {
    const vis = this;

    console.log(vis.parentElement);

    const parent = d3.select(vis.config.parentElement).node();
    const { width, height } = parent.getBoundingClientRect();
    vis.config.containerWidth = width;
    vis.scrollingWidth = height;

    const rowHeight = 5; // pixels per cat
    vis.config.containerHeight = [...new Set(vis.data.map((d) => d.unique_id))].length * rowHeight
        + vis.config.margin.top + vis.config.margin.bottom;

    // const rowWidth = 5; // pixels per cat
    // vis.config.containerWidth = [...new Set(vis.data.map((d) => d.day_number))].length * rowWidth
    //     + vis.config.margin.left + vis.config.margin.right;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.scrollContainer = d3.select(vis.config.parentElement)
      .append('div')
      .style('height', '800px')// visible height
      .style('overflow-y', 'scroll');
    // .style('width', '400px')
    // .style('overflow-w', 'scroll');

    vis.svg = vis.scrollContainer.append('svg')
      .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
      .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom);

    // vis.svg = d3.select(vis.config.parentElement).append('svg')
    //   .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
    //   .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom);

    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .domain(d3.range(1, 11))
      .padding(0.1);

    vis.yScale = d3.scaleBand()
      .range([0, vis.height])
      .padding(0.15);

    vis.xAxis = d3.axisTop(vis.xScale);

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'heatmap-axis x-axis');
    //   .attr('transform', `translate(0, 0)`);

    vis.yAxisG = vis.chartArea.append('g');

    vis.colourScale = d3.scaleLinear()
      // .range(['#fae9e9', '#840000'])
      .range(['#DEECFB', '#203451'])
      .domain(d3.extent(vis.data, (d) => d.distance));

    vis.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '0px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');
    // .style('width', '200px')
    // .style('height', '250px');

    vis.sortBy = d3.select('#sort-select-heatmap').property('value');

    d3.select('#sort-select-heatmap').on('change', function() {
      vis.sortBy = this.value;
      vis.updateVis();
    });

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const totDist = d3.rollup(
      vis.data,
      (v) => d3.sum(v, (d) => d.distance),
      (d) => d.unique_id,
    );

    const avgDist = d3.rollup(
      vis.data,
      (v) => d3.mean(v, (d) => d.distance),
      (d) => d.unique_id,
    );

    const homeRangeMap = new Map(vis.catData.map((d) => [d['unique-id'], d['home-range']]));

    const rangeDist = d3.rollup(
      vis.data,
      (v) => d3.max(v, (d) => d.distance) - d3.min(v, (d) => d.distance),
      (d) => d.unique_id,
    );

    const sortedIds = [...new Set(vis.data.map((d) => d.unique_id))]

    switch (vis.sortBy) {
      case 'tot-dist-dsc':
        sortedIds.sort((a, b) => (totDist.get(b) ?? 0) - (totDist.get(a) ?? 0));
        break;
      case 'tot-dist-asc':
        sortedIds.sort((a, b) => (totDist.get(a) ?? 0) - (totDist.get(b) ?? 0));
        break;
      case 'avg-dist-dsc':
        sortedIds.sort((a, b) => (avgDist.get(b) ?? 0) - (avgDist.get(a) ?? 0));
        break;
      case 'avg-dist-asc':
        sortedIds.sort((a, b) => (avgDist.get(a) ?? 0) - (avgDist.get(b) ?? 0));
        break;
      case 'alphabetical':
        sortedIds.sort((a, b) => a.localeCompare(b));
        break;
      case 'homerange-desc':
        sortedIds.sort((a, b) => (homeRangeMap.get(b) ?? 0) - (homeRangeMap.get(a) ?? 0));
        break;
      default:
        break;
    }

    vis.yScale.domain(sortedIds);

    vis.renderVis();
  }

  reformatNames(d) {
    const countryMap = {
      Australia: 'AU',
      'New Zealand': 'NZ',
      'United States': 'US',
      'United Kingdom': 'UK',
    };
    return d.replace(/_Pet Cats (\w+ ?\w+)/, (match, country) => ` ${countryMap[country] || country}`);
  }

  renderVis() {
    const vis = this;

    vis.chartArea.selectAll('rect')
      .data(vis.data, (d) => `${d.day_number}:${d.unique_id}`)
      .join('rect')
      .attr('x', (d) => vis.xScale(d.day_number))
      .attr('y', (d) => vis.yScale(d.unique_id))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', vis.yScale.bandwidth())
      .style('fill', (d) => vis.colourScale(d.distance))
      .classed('selected', (d) => vis.selectedCat === d.unique_id)
      .style('stroke', (d) => (vis.selectedCat === d.unique_id ? 'black' : 'none'))
      .style('stroke-width', (d) => (vis.selectedCat === d.unique_id ? '2px' : '0px'))
      .on('mouseover', (event, d) => {
        vis.chartArea.selectAll('rect')
          .filter((r) => r.unique_id === d.unique_id)
          .style('stroke', '#490000')
          .style('stroke-width', '1px')
          .classed('hovered', true);

        const catData = vis.radialData.filter((r) => r.unique_id === d.unique_id);

        vis.tooltip
          .style('opacity', 1)
          .style('padding-top', '5px')
          .style('padding-left', '5px')
          .html(`<strong style="font-size: 13px; font-family: Arial">${vis.reformatNames(d.unique_id)}</strong>
           <div id="tooltip-radial"></div>`);

        new RadialChart({ parentElement: '#tooltip-radial' }, catData);
      })
      .on('mousemove', (event) => {
        vis.tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 20}px`);
      })
      .on('mouseout', () => {
        vis.chartArea.selectAll('rect')
          .filter(function() { return !d3.select(this).classed('selected'); })
          .classed('hovered', false)
          .style('stroke', 'none')
          .style('stroke-width', '0px');
        vis.tooltip.style('opacity', 0);
      })
      .on('click', function(event, d) {
        const isSelected = d3.select(this).classed('selected');

        vis.chartArea.selectAll('rect')
          .classed('selected', false)
          .style('stroke', 'none')
          .style('stroke-width', '0px');

        if (!isSelected) {
          vis.chartArea.selectAll('rect')
            .filter((r) => r.unique_id === d.unique_id)
            .classed('selected', true)
            .style('stroke', 'black')
            .style('stroke-width', '2px');

          vis.dispatcher.call('selectedCat', this, d.unique_id);
        }
      });

    vis.xAxisG.call(vis.xAxis);

    if (vis.selectedCat && vis.yScale(vis.selectedCat) !== undefined) {
      d3.select(vis.scrollContainer.node())
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .tween('scroll', () => {
          const start = vis.scrollContainer.node().scrollTop;
          const end = vis.yScale(vis.selectedCat) - 300;
          const i = d3.interpolateNumber(start, end);
          return (t) => { vis.scrollContainer.node().scrollTop = i(t); };
        });
    }
  }
}
