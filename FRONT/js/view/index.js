class IndexView extends View {
  constructor() {
    super();
    Utils.addStyleSheet('style/templates/document-template.css');

    let btn = document.getElementById('add-card');
    btn.addEventListener('click', () => {
      this.popupManager.open('clicked-popup');
    });
  }
}