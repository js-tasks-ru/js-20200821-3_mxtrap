export default class DoubleSlider {
  element;
  subElements = {};

  constructor({
                min = 0,
                max = 0,
                formatValue = value =>  value,
                selected = {
                  from: min,
                  to: max
                }
              } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  onSliderPointerMove = event => {
    event.preventDefault();

    const { left: innerLeft, right: innerRight, width } = this.subElements.innerBar.getBoundingClientRect();

    if (this.dragging === this.subElements.sliderLeft) {
      let newLeft = (event.clientX - innerLeft + this.shiftX) / width;

      if (newLeft < 0) {
        newLeft = 0;
      }
      newLeft *= 100;
      let right = parseFloat(this.subElements.sliderRight.style.right);

      if (newLeft + right > 100) {
        newLeft = 100 - right;
      }

      this.dragging.style.left = this.subElements.progressBar.style.left = newLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.getValue().from);
    }

    if (this.dragging === this.subElements.sliderRight) {
      let newRight = (innerRight - event.clientX - this.shiftX) / width;

      if (newRight < 0) {
        newRight = 0;
      }
      newRight *= 100;

      let left = parseFloat(this.subElements.sliderLeft.style.left);

      if (left + newRight > 100) {
        newRight = 100 - left;
      }
      this.dragging.style.right = this.subElements.progressBar.style.right = newRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  onSliderPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onSliderPointerMove);
    document.removeEventListener('pointerup', this.onSliderPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };







  initEventListeners() {
    const { sliderLeft, sliderRight } = this.subElements;

    sliderLeft.addEventListener('pointerdown', event => this.onSliderPointerDown(event));
    sliderRight.addEventListener('pointerdown', event => this.onSliderPointerDown(event));
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);
  }

  update() {
    const rangeTotal = this.max - this.min;
    const left = Math.floor((this.selected.from - this.min) / rangeTotal * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / rangeTotal * 100) + '%';

    this.subElements.progressBar.style.left = left;
    this.subElements.progressBar.style.right = right;

    this.subElements.sliderLeft.style.left = left;
    this.subElements.sliderRight.style.right = right;
  }

  onSliderPointerDown(event) {
    const slider = event.target;

    event.preventDefault();

    const { left, right } = slider.getBoundingClientRect();

    if (slider === this.subElements.sliderLeft) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.dragging = slider;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onSliderPointerMove);
    document.addEventListener('pointerup', this.onSliderPointerUp);
  }

  getValue() {
    const rangeTotal = this.max - this.min;
    const { left } = this.subElements.sliderLeft.style;
    const { right } = this.subElements.sliderRight.style;

    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }

  getTemplate() {
    const { from, to } = this.selected;

    return `<div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div data-element="innerBar" class="range-slider__inner">
        <span data-element="progressBar" class="range-slider__progress"></span>
        <span data-element="sliderLeft" class="range-slider__thumb-left"></span>
        <span data-element="sliderRight" class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.element.ondragstart = () => false;

    this.subElements = this.getSubElements(element);

    this.initEventListeners();

    this.update();
  }

}
