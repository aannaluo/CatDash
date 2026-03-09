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
      containerWidth: 650,
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
      .domain(['0-2', '3-5', '5+'])
      .range(['#ffd700', '#b060eb', '#5381ff']);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Step 1: assign category
    vis.data.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      if (d.prey_p_month <= 2) d.preyCategory = '0-2';
      // eslint-disable-next-line no-param-reassign
      else if (d.prey_p_month <= 5) d.preyCategory = '3-5';
      // eslint-disable-next-line no-param-reassign
      else d.preyCategory = '5+';
    });

    const preyCats = ['0-2', '3-5', '5+'];

    // Step 2: nest by hour, then category
    const summary = d3.rollups(
      vis.data,
      (v) => d3.mean(v, (d) => d.avg_distance_p_hour),
      (d) => d.hour,
      (d) => d.preyCategory,
    );

    // Step 3: convert to a structure usable by d3.stack
    // For each hour, create an object: { hour: 0, '0-4': mean, '5-7': mean, '8+': mean }
    vis.stackedData = summary.map(([hour, values]) => {
      const row = { hour };
      preyCats.forEach((cat) => {
        const entry = values.find((v) => v[0] === cat);
        row[cat] = entry ? entry[1] : 0;
      });

      return row;
    });

    vis.stack = d3.stack()
      .keys(preyCats); // categories
    // console.log(vis.stack);

    console.log(vis.stackedData);

    vis.series = vis.stack(vis.stackedData);
    // console.log(vis.series);

    const maxStack = d3.max(vis.stackedData, (d) => preyCats
      .reduce((sum, k) => sum + d[k], 0));

    vis.yScale.domain([0, maxStack]);

    vis.xScale.domain(d3.range(24));

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    vis.chartArea.selectAll('g.layer')
      .data(vis.series)
      .join('g')
      .attr('class', 'layer')
      .attr('fill', (d) => vis.zScale(d.key)) // color by category
      .selectAll('path')
      .data((d) => d)
      .join('path')
      .attr('d', d3.arc()
        .innerRadius((d) => vis.yScale(d[0]))
        .outerRadius((d) => vis.yScale(d[1]))
        .startAngle((d) => vis.xScale(d.data.hour))
        .endAngle((d) => vis.xScale(d.data.hour) + vis.xScale.bandwidth())
        .padAngle(0.01)
        .padRadius(vis.innerRadius))
      .on('mouseover', (event, d) => {
        const meanDistance = d[1] - d[0];
        const category = d.key;
        const { hour } = d.data;
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`)
          .html(`
            <div><strong>Hour:</strong> ${hour}</div>
            <div><strong>Category:</strong> ${category}</div>
            <div><strong>Mean distance:</strong> ${meanDistance.toFixed(1)}</div>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });
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

    vis.yTicks = vis.yScale.ticks(3);

    vis.chartArea.selectAll('.y-grid')
      .data(vis.yTicks)
      .join('circle')
      .attr('class', 'y-grid')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
    //   .attr('stroke-dasharray', '2,2')
      .attr('r', (d) => vis.yScale(d));

    vis.chartArea.selectAll('.y-axis-label')
      .data(vis.yTicks)
      .join('text')
      .attr('class', 'y-axis-label')
      .attr('x', 0)
      .attr('y', (d) => -vis.yScale(d))
      .attr('dy', '-0.3em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d);

    const preyCats = ['0-2', '3-5', '5+'];

    vis.legend = vis.chartArea.selectAll('g.legend')
      .data(preyCats)
      .join('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0, ${i * 20 - 20})`);

    vis.legend.append('rect')
      .attr('x', 2 * vis.innerRadius)
      .attr('y', -10)
      .attr('width', 14)
      .attr('height', 14)
      .attr('fill', vis.zScale);

    vis.legend.append('text')
      .attr('x', 2 * vis.innerRadius + 20)
      .attr('y', -3)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .text((d) => d);

    vis.chartArea.append('text')
      .attr('class', 'radial-legend-title')
      .attr('x', 2 * vis.innerRadius)
      .attr('y', -50)
      .attr('font-size', '12px')
      .attr('padding-bottom', '0px')
      .text('Prey Per Month');
  }
}
