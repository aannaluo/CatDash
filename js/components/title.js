// eslint-disable-next-line no-unused-vars
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
          <button id="random-cat-btn" class="random-cat-button"><img src="images/shuffle-cat-logo.png" alt="shuffle" class="button-icon"> Random Cat!</button>
        </div>
      `);
  }
}
