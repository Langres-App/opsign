class IndexView extends View {
  constructor() {
    super();
    this.addNeededScripts();
    Utils.addStyleSheet('style/templates/document-template.css');

    let btn = document.getElementById('add-card');
    btn.addEventListener('click', () => {
      this.popupManager.open('document-popup');
    });

  }

  addNeededScripts() {
    // we wait for the scripts to be loaded before creating the view
    Promise.all([
      Utils.addScript('js/model/Version.js'),
      Utils.addScript('js/model/PoDocument.js'),
      Utils.addScript('js/model/DocumentTemplateManager.js')
    ]).then(() => {
        // TODO
      });
  }
}