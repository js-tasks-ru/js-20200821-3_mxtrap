export default class NotificationMessage {
  static isOpen;
  element;

  constructor(message, {duration = 2000, type = 'success'} = {}) {

    if (NotificationMessage.isOpen) {
      NotificationMessage.isOpen.remove();
    }

    this.message = message;
    this.duration = duration;
    this.type = type;
    this.secondsDuration = (duration / 1000) + 's';

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value: ${this.secondsDuration}">
        <div class="timer"></div>
        <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
            ${this.message}
      </div>
    </div>
  </div>
    `;
  }

  show(parent = document.body) {
    parent.append(this.element);

    setTimeout(()=>{
      this.remove();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    NotificationMessage.isOpen = null;
  }

  render() {
    const elem = document.createElement('div');

    elem.innerHTML = this.getTemplate();

    this.element = elem.firstElementChild;

    NotificationMessage.isOpen = this.element;
  }
}
