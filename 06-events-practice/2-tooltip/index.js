class Tooltip {
  element;

  static activeTooltip;

  constructor() {
    if (Tooltip.activeTooltip) {
      return Tooltip.activeTooltip;
    }

    Tooltip.activeTooltip = this;
  }


  onMouseOverTooltip = (event) => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.moveTooltip(event);

      document.addEventListener('pointermove', this.moveTooltip);
    }
  }

  onMouseOutTooltip = () => {
    if (this.element) {
      this.remove();

      document.removeEventListener('mousemove', this.moveTooltip);
    }
  }

  moveTooltip = (event) => {
    this.element.style.left = `${event.clientX}px`;
    this.element.style.right = `${event.clientY}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      document.removeEventListener('pointermove', this.moveTooltip);
    }
  }

  destroy() {
    this.remove();

    document.removeEventListener('pointerover', this.onMouseOverTooltip);
    document.removeEventListener('pointerout', this.onMouseOutTooltip);
  }

  initialize() {
    document.addEventListener('pointerover', this.onMouseOverTooltip);
    document.addEventListener('pointerout', this.onMouseOutTooltip);
  }


  render(message) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = message;

    document.body.append(this.element);
  }

}

const tooltip = new Tooltip();

export default tooltip;
