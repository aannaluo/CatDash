// function getPreyCategory(val) {
//   let category;
//   if (val >= 0 && val <= 4) category = '0-4';
//   else if (val >= 5 && val <= 7) category = '5-7';
//   else category = '8+';
//   return category;
// }

// eslint-disable-next-line no-unused-vars
class RadialChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 200,
      containerHeight: 220,
      margin: {
        top: 5, right: 5, bottom: 5, left: 5,
      },
    };
    this.data = _data;
    // this.selectedCat = 'Abba_Pet Cats United Kingdom';
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    vis.innerRadius = 40;
    vis.outerRadius = Math.min(vis.width, vis.height) / 2;
    // vis.linearScale = d3.scaleLinear()

    vis.svg = d3.select(vis.config.parentElement).append('svg')
    //   .attr('id', 'radial')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr(
        'transform',
        `translate(${vis.config.containerWidth / 2},${vis.config.containerHeight / 2 })`,
      );

    vis.xScale = d3.scaleBand()
      .domain(d3.range(24))
      .range([0, 2 * Math.PI])
      .align(0);

    vis.yScale = d3.scaleRadial()
      .range([vis.innerRadius, vis.outerRadius]);

    // vis.zScale = d3.scaleOrdinal()
    //   .domain(['0-2', '3-5', '5+'])
    //   .range(['#ffd700', '#b060eb', '#5381ff']);
    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // const catData = vis.data.filter((d) => d['unique_id'] === vis.selectedCat);

    // if (!catData) {
    //   console.warn(`Cat "${vis.selectedCat}" not found`);
    //   console.log('catData sample:', catData.slice(0, 3));
    //   return;
    // }

    vis.yScale.domain([0, d3.max(vis.data, (d) => d.avg_distance)]);

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    vis.chartArea
      .selectAll('path.bar')
      .data(vis.data, (d) => d.curr_hour)
      .join('path')
      .attr('class', 'radial-bar')
      .attr('fill', '#69b3a2')
      .attr('d', d3.arc()
        .innerRadius(vis.innerRadius)
        .outerRadius((d) => vis.yScale(d.avg_distance))
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
        return Math.cos(angle) * (vis.innerRadius + 15); // slightly inside inner radius
      })
      .attr('y', (d) => {
        const angle = vis.xScale(d.curr_hour) + vis.xScale.bandwidth() / 2 - Math.PI / 2;
        return Math.sin(angle) * (vis.innerRadius + 15);
      })
      .text((d) => d.curr_hour);

    // vis.yTicks = vis.yScale.ticks(3);

    // vis.chartArea.selectAll('.y-grid')
    //   .data(vis.yTicks)
    //   .join('circle')
    //   .attr('class', 'y-grid')
    //   .attr('fill', 'none')
    //   .attr('stroke', '#ccc')
    // //   .attr('stroke-dasharray', '2,2')
    //   .attr('r', (d) => vis.yScale(d));

    // vis.chartArea.selectAll('.y-axis-label')
    //   .data(vis.yTicks)
    //   .join('text')
    //   .attr('class', 'y-axis-label')
    //   .attr('x', 0)
    //   .attr('y', (d) => -vis.yScale(d))
    //   .attr('dy', '-0.3em')
    //   .attr('text-anchor', 'middle')
    //   .attr('font-size', '12px')
    //   .attr('font-weight', 'bold')
    //   .text((d) => `${d}m`);
  }
}
