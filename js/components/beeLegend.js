const svg = d3.select('#bee #legend')
  .append('svg')
  .attr('width', '150px')
  .attr('height', '100px')
  .attr('transform', 'translate(520, 10)');

svg.append('text')
  .text('Neutered Status')
  .attr('font-size', '12px')
  .attr('transform', 'translate(0, 15)');

const neutered = svg.append('g')
  .attr('transform', 'translate(10,30)');

neutered.append('path')
  .attr('d', d3.symbol(d3.symbolCircle));

neutered.append('text')
  .text('Neutered')
  .attr('font-size', '12px')
  .attr('transform', 'translate(10, 4)');

const notNeutered = svg.append('g')
  .attr('transform', 'translate(10, 50)');

notNeutered.append('path')
  .attr('d', d3.symbol(d3.symbolCross));

notNeutered.append('text')
  .text('Not Neutered')
  .attr('font-size', '12px')
  .attr('transform', 'translate(10, 4)');

const unkNeutered = svg.append('g')
  .attr('transform', 'translate(10, 70)');

unkNeutered.append('path')
  .attr('d', d3.symbol(d3.symbolDiamond));

unkNeutered.append('text')
  .text('Unknown')
  .attr('font-size', '12px')
  .attr('transform', 'translate(10, 4)');

// d3.select('#info-b')
//   .on('click', (event) => {
//     d3.select('#info-tooltip')
//       .style('display', 'block')
//       .style('left', `${event.pageX + 20}px`)
//       .style('top', `${event.pageY + 20}px`);
//   });
