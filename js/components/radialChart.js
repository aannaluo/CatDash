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
      containerWidth: 400,
      containerHeight: 325,
      margin: {
        top: 20, right: 20, bottom: 20, left: 20,
      },
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    vis.innerRadius = 80;
    vis.outerRadius = Math.min(vis.width, vis.height) / 2;
    // vis.linearScale = d3.scaleLinear()

    vis.svg = d3.select(vis.config.parentElement).append('svg')
    //   .attr('id', 'radial')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
      .attr(
        'transform',
        `translate(${vis.config.containerWidth / 2},${vis.config.containerHeight / 2})`,
      );

    vis.xScale = d3.scaleBand()
      .range([0, 2 * Math.PI])
      .align(0);

    vis.yScale = d3.scaleRadial()
      .range([vis.innerRadius, vis.outerRadius]);

    vis.zScale = d3.scaleOrdinal()
      .domain(['0-4', '5-7', '8+'])
      .range(['#98abc5', '#6b486b', '#ff8c00']);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Step 1: assign category
    vis.data.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      if (d.prey_p_month <= 4) d.preyCategory = '0-4';
      // eslint-disable-next-line no-param-reassign
      else if (d.prey_p_month <= 7 && d.prey_p_month > 4) d.preyCategory = '5-7';
      // eslint-disable-next-line no-param-reassign
      else d.preyCategory = '8+';
    });

    // Step 2: nest by hour, then category
    const nested = d3.rollups(
      vis.data,
      (v) => d3.mean(v, (d) => d.avg_distance_p_hour),
      (d) => d.hour,
      (d) => d.preyCategory,
    );

    // Step 3: convert to a structure usable by d3.stack
    // For each hour, create an object: { hour: 0, '0-4': mean, '5-7': mean, '8+': mean }
    vis.stackedData = nested.map(([hour, catArr]) => {
      const obj = { hour: +hour };
      catArr.forEach(([cat, meanVal]) => {
        obj[cat] = meanVal;
      });
      // ensure missing categories get 0
      ['0-4', '5-7', '8+'].forEach((c) => { if (!(c in obj)) obj[c] = 0; });
      return obj;
    });

    vis.stack = d3.stack()
      .keys(['0-4', '5-7', '8+']); // categories

    const maxStack = d3.max(vis.stackedData, (d) => ['0-4', '5-7', '8+']
      .reduce((sum, k) => sum + d[k], 0));

    vis.yScale.domain([0, maxStack]);

    vis.xScale.domain(vis.data.map((d) => d.hour));
    // vis.yScale.domain([0, d3.max(vis.data, (d) => d.avg_distance_p_hour)]);
    // vis.zScale.domain([5, 8]);
    // vis.zScale.domain([vis.data.map((d) => d.preyCategory)]);
    // vis.xAx

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    // vis.chartArea
    //   .selectAll('path')
    //   .data(vis.data)
    //   .enter()
    //   .append('path')
    //   .attr('fill', (d) => vis.zScale(d.category))
    //   .attr('d', d3.arc()
    //     .innerRadius(vis.innerRadius)
    //     .outerRadius((d) => vis.yScale(d.avg_distance_p_hour))
    //     .startAngle((d) => vis.xScale(d.hour))
    //     .endAngle((d) => vis.xScale(d.hour) + vis.xScale.bandwidth())
    //     .padAngle(0.01)
    //     .padRadius(vis.innerRadius));

    const series = vis.stack(vis.stackedData);

    vis.chartArea.selectAll('g.layer')
      .data(series)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => vis.zScale(d.preyCategory)) // color by category
      .selectAll('path')
      .data((d) => d)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius((d) => vis.yScale(d[0]))
        .outerRadius((d) => vis.yScale(d[1]))
        .startAngle((d) => vis.xScale(d.data.hour))
        .endAngle((d) => vis.xScale(d.data.hour) + vis.xScale.bandwidth())
        .padAngle(0.01)
        .padRadius(vis.innerRadius));

    // Add hour labels
    vis.chartArea.selectAll('text.hour-label')
      .data(vis.stackedData)
      .join('text')
      .attr('class', 'hour-label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('x', (d) => {
        const angle = vis.xScale(d.hour.toString()) + vis.xScale.bandwidth() / 2 - Math.PI / 2;
        return Math.cos(angle) * (vis.innerRadius - 10); // slightly inside inner radius
      })
      .attr('y', (d) => {
        const angle = vis.xScale(d.hour.toString()) + vis.xScale.bandwidth() / 2 - Math.PI / 2;
        return Math.sin(angle) * (vis.innerRadius - 10);
      })
      .text((d) => d.hour);
  }
}
