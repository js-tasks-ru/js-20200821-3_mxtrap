const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
                url,
                range = {from: new Date(), to: new Date()},
                label = '',
                link = '',
                formatHeading = item => item} = {}) {
    this.url = url;
    this.label = label;
    this.link = link;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();

  }
  async getDataFromServer(url, range) {
    const reqUrl = new URL(url, BACKEND_URL);
    reqUrl.searchParams.set('from', range.from);
    reqUrl.searchParams.set('to', range.to);

    const response = await fetch(reqUrl.toString());
    return await response.json();
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((acc, item)=>(acc + item), 0));
  }

  async createChart(range) {
    this.element.classList.add('column-chart_loading');
    this.range = range;
    const data = await this.getDataFromServer(this.url, range);

    if (data && Object.values(data).length) {
      this.subElements.header.innerHTML = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumn(data);

      this.element.classList.remove('column-chart_loading');
    }

  }

  getColumn(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data)
      .map(([key, value]) => {

        const percent = Math.round(value / maxValue * 100);
        const tooltip = `<span>
            <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
            <br>
            <strong>${percent}%</strong>
        </span>`;

        return `<div style="--value: ${Math.floor(value * this.chartHeight / maxValue)}" data-tooltip="${tooltip}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }



  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">

          </div>
        </div>
      </div>
    `;
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.createChart(this.range);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(from, to) {
    return await this.createChart({from, to});
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
