

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {
  element;
  subElements;
  data=[];


  constructor(headerStructure = [], {
    url = '',
    isLocalSort = false,
    step = 20,
    start = 1,
    end = start + step
  }) {
    this.headerStructure = headerStructure;
    this.url = url;
    this.sortField = headerStructure.find(item=>item.sortable).id;
    this.order = 'asc';
    this.start = start;
    this.end = end;
    this.isLocalSort = isLocalSort;

    this.render();
  }

  onScroll = async () =>{
    const bottom = this.element.getClientRects().bottom;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(this.id, this.order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  }



  async getDataFromServer(id, order, start, end) {
    const reqUrl = new URL(this.url, BACKEND_URL);
    reqUrl.searchParams.set('_sort', id);
    reqUrl.searchParams.set('_order', order);
    reqUrl.searchParams.set('_start', start);
    reqUrl.searchParams.set('_end', end);


    const response = await fetch(reqUrl.toString());
    return await response.json();
  }


  async loadData(id, order, start = this.start, end = this.end) {
    this.element.classList.add('column-chart_loading');

    const data = await this.getDataFromServer(id, order, start, end);

    this.element.classList.remove('column-chart_loading');

    return data;
  }

  loadRows(data) {

    if (data.length) {
      this.element.classList.remove('sortable-table_empty');

      this.data = data;
      this.subElements.body.innerHTML = this.createBodyRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }

  }



  createHeaderRow({id, title, sortable}) {
    const order = this.sortField === id ? this.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.createSortingArrow(id)}
    </div>
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

  createTable() {
    return `
       <div class="sortable-table">
         ${this.createHeader()}
         ${this.createBody(this.data)}

         <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            No products
        </div>
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
    const direction = {
      'asc': 1,
      'desc': -1
    };
    const sortTypeFunctions = {
      number: (a, b)=>direction[order] * (a[field] - b[field]),
      string: (a, b)=>direction[order] * a[field].localeCompare(b[field], 'ru'),
      custom: (a, b)=>direction[order] * column.custom(a, b)
    };
    const sortFunc = sortTypeFunctions[column.sortType];

    return arr.sort((a, b)=>sortFunc(a, b)

    );
  }

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const orderTypes = {
      asc: 'desc',
      desc: 'asc'
    };

    if (column) {
      const id = column.dataset.id;
      const order = column.dataset.order;
      const newOrder = orderTypes[order];

      this.id = id;
      this.order = newOrder;

      const sortArrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!sortArrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isLocalSort) {
        const sortedData = this.sortData(id, newOrder, this.data);
        this.subElements.body.innerHTML = this.createBodyRows(sortedData);
      } else {
        this.sortOnServer(id, newOrder, this.start, this.end);
      }

    }
  }

  createSortingArrow (field) {
    const order = this.sortField === field ? this.order : '';

    return order
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  initializeSortListener() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onScroll);
  }

  getSubElement(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElem)=>{
      accum[subElem.dataset.element] = subElem;

      return accum;
    }, {});
  }

  async sortOnServer(id, order, start, end) {
    const data = this.loadData(id, order, start, end);

    this.loadRows(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, data];

    rows.innerHTML = this.createBodyRows(data);

    this.subElements.body.append(...rows.children);
  }

  async render() {

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.createTable();

    const elem = wrapper.firstElementChild;

    this.element = elem;
    this.subElements = this.getSubElement(elem);

    const data = await this.loadData(this.sortField, this.order, this.start, this.end);

    this.loadRows(data);
    this.initializeSortListener();
  }
}
