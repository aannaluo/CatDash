class HeatMap {
  constructor(_config, _data, _radialData, dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 450,
      containerHeight: 700,
      margin: {
        top: 20, right: 20, bottom: 20, left: 20,
      },
    };
    this.data = _data;
    this.radialData = _radialData;
    this.dispatcher = dispatcher;
    this.selectedCat = 'Abba_Pet Cats United Kingdom';
    this.initVis();
  }

  initVis() {
    const vis = this;

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
      .style('height', '850px')// visible height
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
      .padding(0.01);

    const totalDistanceByAnimal = d3.rollup(
      vis.data.filter((d) => d.day_number <= 10),
      (v) => d3.sum(v, (d) => d.distance),
      (d) => d.unique_id,
    );

    const sortedIds = [...new Set(vis.data.map((d) => d.unique_id))]
      .sort((a, b) => (totalDistanceByAnimal.get(b) ?? 0) - (totalDistanceByAnimal.get(a) ?? 0));

    vis.yScale = d3.scaleBand()
      .range([0, vis.height])
      .domain(sortedIds);

    vis.xAxisG = vis.chartArea.append('g');
    //   .attr('transform', `translate(0, 0)`);

    vis.yAxisG = vis.chartArea.append('g');

    vis.colourScale = d3.scaleLinear()
      .range(['#fae9e9', '#840000'])
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

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.renderVis();
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
      // .on('mouseover', (event, d) => {
      //   vis.chartArea.selectAll('rect')
      //     .filter((r) => r.unique_id === d.unique_id)
      //     // .raise()
    // .style('stroke', 'white')
    // .style('stroke-width', '2px');
      //   const allDays = vis.data
      //     .filter((r) => r.unique_id === d.unique_id && r.day_number <= 10)
      //     .sort((a, b) => a.day_number - b.day_number);

    //   const dayRows = allDays
    //     .map((r) => `<p>Day ${r.day_number}: ${r.distance.toFixed(2)}m</p>`)
    //     .join('');

      //   vis.tooltip
      //     .style('opacity', 1)
      //     .style('font-family', 'Arial')
      //     .html(`
      //       <strong style="font-size: 15px;">${vis.reformatNames(d.unique_id)}</strong><br/>
      //       ${dayRows}
      //     `);
      // })
      .on('mouseover', (event, d) => {
        vis.chartArea.selectAll('rect')
          .filter((r) => r.unique_id === d.unique_id)
          .style('stroke', 'white')
          .style('stroke-width', '2px')
          .classed('hovered', true);

        const catData = vis.radialData.filter((r) => r.unique_id === d.unique_id);

        vis.tooltip
          .style('opacity', 1)
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
          .classed('hovered', false)
          .style('stroke', 'none')
          .style('stroke-width', '0px');
        // .sort((a, b) => vis.yScale(a.unique_id) - vis.yScale(b.unique_id));
        vis.tooltip.style('opacity', 0);
      })
      .on('click', function () {
        const selected = d3.select(this).classed('selected');
        d3.select(this).classed('selected', !selected);
        if (!selected) {
          const selectedCat = d3.select(this).data()[0].unique_id;
          console.log(d3.select(this).data());
          vis.dispatcher.call('selectedCat', this, selectedCat);
        }
      });

    vis.xAxisG.call(d3.axisTop(vis.xScale));
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
}
