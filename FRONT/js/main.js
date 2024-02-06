addPlasticOmniumIco();
addPlasticOmniumLogo();
addStyleSheetsAndScripts();


function addPlasticOmniumIco() {
    // create the link element
    let link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = Utils.getRelativePathToRoot() + 'img/Plastic_Omnium_noname.svg';

    // add the link to the head
    document.head.appendChild(link);
}

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
async function addStyleSheetsAndScripts() {
    // get the name of the current page (url without the domain name and the parameters) as a table
    const doc = document.location.pathname.split('/');

    // get the last element of the table and remove the '.html' extension
    let docName = doc[doc.length - 1].replace('.html', '');

    // if the page is the index but as the '/charte' url, we set the name to 'index'
    if (docName === 'charte') docName = 'index';


    // add the style sheets to the page
    Utils.addStyleSheet('style/main.css');
    Utils.addStyleSheet(`style/pages/${docName}.css`);


    // add the scripts to the page (we use a promise to wait for all the scripts to be loaded before creating the view)
    await Utils.addScript('js/view/View.js');
    await Utils.addScript(`js/view/${docName}.js`);

    // depending on the page, we create the correct view
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
}

