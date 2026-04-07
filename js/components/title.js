class Title {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
    };
    this.initVis();
  }

  initVis() {
    const vis = this;
    const parent = d3.select(vis.config.parentElement);
    parent.html('');

    parent.append('div')
      .attr('class', 'title-container')
      .html(`
        <div class="title-content">
          <h1>Cat Dash</h1>
      `);
  }
}
