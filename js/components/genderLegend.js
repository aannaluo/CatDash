function renderGenderLegend() {
    const svg = d3.select('#bee #gender-legend')
    .append('svg')
    .attr('width', '150px')
    .attr('height', '100px')
    .attr('transform', 'translate(470, 300)');
  
  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', '#f7f7f7');
  
  svg.append('text')
    .text('Gender')
    .attr('font-size', '12px')
    .attr('transform', 'translate(0, 20)');
  
  const female = svg.append('g')
    .attr('transform', 'translate(8,30)');
  
    female.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', '#bc86a1')

  
    female.append('text')
    .text('Female')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');
  
  const male = svg.append('g')
  .attr('transform', 'translate(8,50)');
  
male.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', '#4d859f')
  
  
    male.append('text')
    .text('Male')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');
  
  const unk = svg.append('g')
  .attr('transform', 'translate(8,70)');
  
    unk.append('rect')
    .attr('width', '7px')
    .attr('height', '7px')
    .style('fill', 'rgb(191, 167, 230)')

  
    unk.append('text')
    .text('Unknown')
    .attr('font-size', '12px')
    .attr('transform', 'translate(12, 7)');

}

