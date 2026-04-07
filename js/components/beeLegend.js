function renderGenderLegend() {
  const svg = d3.select('#bee #gender-legend')
    .append('svg')
    .attr('width', '90px')
    .attr('height', '100px')
    .attr('transform', 'translate(470, 300)');

  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', '#fffaef');

  svg.append('text')
    .text('Gender')
    .attr('font-size', '12px')
    .attr('transform', 'translate(0, 20)');

  const female = svg.append('g')
    .attr('transform', 'translate(8,30)');

  female.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', '#ed8ebe');

  female.append('text')
    .text('Female')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');

  const male = svg.append('g')
    .attr('transform', 'translate(8,50)');

  male.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', '#65adcf');

  male.append('text')
    .text('Male')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');

  const unk = svg.append('g')
    .attr('transform', 'translate(8,70)');

  unk.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', 'rgb(197, 164, 251)');

  unk.append('text')
    .text('Unknown')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');
}

function renderNeuterLegend() {
  const svg = d3.select('#bee #neutered-legend')
    .append('svg')
    .attr('width', '100px')
    .attr('height', '100px')
    .attr('transform', 'translate(470, 400)');

  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', '#fffaef');

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
}
