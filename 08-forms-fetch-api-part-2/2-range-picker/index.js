export default class RangePicker {
  element = null;
  subElements = {};
  selectingFrom = true;
  range = {
    from: new Date(),
    to: new Date()
  };

  constructor({from = new Date(), to = new Date()} = {}) {
    this.dateFrom = new Date(from);
    this.range = {from, to};

    this.render();
  }


  formatDate(date) {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.close();
    }
  };


  getTemplate() {
    const from = this.formatDate(this.range.from);
    const to = this.formatDate(this.range.to);

    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${from}</span> -
        <span data-element="to">${to}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }



  initEventListeners() {
    const {input, selector} = this.subElements;

    document.addEventListener('click', this.onDocumentClick, true);

    input.addEventListener('click', () => this.toggle());
    selector.addEventListener('click', event => this.onSelectorClick(event));
  }

  toggle() {
    this.element.classList.toggle('rangepicker_open');
    this.renderRange();
  }

  onSelectorClick({target}) {
    if (target.classList.contains('rangepicker__cell')) {
      this.onCellClick(target);
    }
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  renderRange() {
    const date1 = new Date(this.dateFrom);
    const date2 = new Date(this.dateFrom);
    const { selector } = this.subElements;

    date2.setMonth(date2.getMonth() + 1);

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(date1)}
      ${this.renderCalendar(date2)}
    `;

    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.prev());
    controlRight.addEventListener('click', () => this.next());

    this.renderSelection();
  }

  prev() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() - 1);
    this.renderRange();
  }

  next() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() + 1);
    this.renderRange();
  }

  renderSelection() {
    const { from, to } = this.range;

    for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (from) {
      const selectedFromElem = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFromElem) {
        selectedFromElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const selectedToElem = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedToElem) {
        selectedToElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  createGrid(day) {
    const index = day === 0 ? 6 : (day - 1);
    return index + 1;
  }

  renderCalendar(showDate) {
    const date = new Date(showDate);

    date.setDate(1);

    const monthStr = date.toLocaleString('ru', {month: 'long'});

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    let table = `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime=${monthStr}>${monthStr}</time>
      </div>
      <div class="rangepicker__day-of-week">
        ${days.map(item=>`<div>${item}</div>`).join('')}
      </div>
      <div class="rangepicker__date-grid">
    `;


    table += `
      <button type="button"
        class="rangepicker__cell"
        data-value="${date.toISOString()}"
        style="--start-from: ${this.createGrid(date.getDay())}">
          ${date.getDate()}
      </button>`;

    date.setDate(2);

    while (date.getMonth() === showDate.getMonth()) {
      table += `
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}">
            ${date.getDate()}
        </button>`;

      date.setDate(date.getDate() + 1);
    }


    table += '</div></div>';

    return table;
  }

  onCellClick(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.range = {
          from: dateValue,
          to: null
        };
        this.selectingFrom = false;
        this.renderSelection();
      } else {
        if (dateValue > this.range.from) {
          this.range.to = dateValue;
        } else {
          this.range.to = this.range.from;
          this.range.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderSelection();
      }

      if (this.range.from && this.range.to) {
        this.dispatchEvent();
        this.close();
        this.subElements.from.innerHTML = this.formatDate(this.range.from);
        this.subElements.to.innerHTML = this.formatDate(this.range.to);
      }
    }
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.range
    }));
  }

  remove() {
    this.element.remove();

    document.removeEventListener('click', this.onDocumentClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingFrom = true;
    this.range = {
      from: new Date(),
      to: new Date()
    };

  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

}
