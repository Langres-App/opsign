addStyleSheetsAndScripts();
addPlasticOmniumLogo();

/**
 * Add the Plastic Omnium logo to the page
 */
function addPlasticOmniumLogo() {
    // create the logo container
    let logoContainer = Utils.createHTMLElement('div', 'backgroundImage');

    // create the logo and set its attributes
    let logo = document.createElement('img');
    logo.src = Utils.getRelativePathToRoot() + 'img/Plastic_Omnium_noname.svg';
    logo.alt = '';

    // add the logo to the container
    logoContainer.appendChild(logo);

    // add the container to the body in the first position
    document.body.innerHTML = logoContainer.outerHTML + document.body.outerHTML;
}

/**
 * Add the style sheets and scripts to the page depending on the current page
 */
function addStyleSheetsAndScripts() {
    // get the name of the current page (url without the domain name and the parameters) as a table
    const doc = document.location.pathname.split('/');

    // get the last element of the table and remove the '.html' extension
    let docName = doc[doc.length - 1].replace('.html', '');

    // if the page is the index but as the '/charte' url, we set the name to 'index'
    if (docName === 'charte') docName = 'index';


    // add the style sheets to the page
    Utils.addStyleSheet('style/main.css');
    Utils.addStyleSheet(`style/pages/${docName}.css`);


    // add the scripts to the page (in the right order)
    Utils.addScript('js/view/View.js', () => {
        Utils.addScript(`js/view/${docName}.js`, () => {
            // TODO : start the page script
            console.log(docName);
            switch (docName) {
                case 'charte':
                case 'index':
                    new IndexView();
                    break;
                case 'signing':
                    new SigningView();
                    break;
                case 'signedList':
                    new SignedListView();
                    break;
                case 'login':
                    new LoginView();
                    break;

            }
        });
    });

}

