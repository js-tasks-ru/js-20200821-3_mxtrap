export default class SortableTable {
  element;
  subElements;

  constructor(headerStructure = [], {data = []}) {
    this.headerStructure = headerStructure;
    this.data = data;

    this.render();
  }

  createHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.createSortingArrow()}
    </div>
    `;
  }

  createSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
    </span>
    `;
  }

  createHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerStructure.map(item=>this.createHeaderRow(item)).join('')}
    </div>
    `;
  }

  createBodyRow(cell) {
    return this.headerStructure.map(item=>item.temaplate
      ? item.temaplate(cell[item.id])
      : `<div class="sortable-table__cell">${cell[item.id]}</div>`
    ).join('');
  }

  createBodyRows(data) {
    return data.map(item=> `
    <div class="sortable-table__row">
        ${this.createBodyRow(item)}
    </div>
    `).join('');
  }

  createBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
       ${this.createBodyRows(data)}
       </div>
    `;
  }

  createTable(data) {
    return `
       <div class="sortable-table">
         ${this.createHeader()}
         ${this.createBody(data)}
       </div>
    `;
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order, this.data);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id=${field}]`);

    allColumns.forEach(item=>{
      item.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.createBodyRows(sortedData);
  }

  sortData(field, order, array) {
    const arr = [...array];
    const column = this.headerStructure.find(item=>item.id === field);
    const direction = order === 'asc' ? 1 : -1;
    const sortTypeFunctions = {
      number: (a, b)=>direction * (a[field] - b[field]),
      string: (a, b)=>direction * a[field].localeCompare(b[field], 'ru'),
      custom: (a, b)=>direction * column.custom(a, b)
    };
    const sortFunc = sortTypeFunctions[column.sortType];

    return arr.sort((a, b)=>sortFunc(a, b)

    );
  }

  getSubElement(element) {

    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElem)=>{
      accum[subElem.dataset.element] = subElem;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.createTable(this.data);

    const elem = wrapper.firstElementChild;

    this.element = elem;

    this.subElements = this.getSubElement(elem);
  }
}

