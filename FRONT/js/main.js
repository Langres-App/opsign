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

    // if the page is the index but as the '/posign' url, we set the name to 'index'
    if (docName === 'posign') docName = 'index';

    // add the style sheets to the page
    Utils.addStyleSheet('style/main.css');
    Utils.addStyleSheet(`style/pages/${docName}.css`);

    await Utils.addScript('js/model/Instantiator.js');

    // prepare to reload if the user logs out
    document.addEventListener('USER_LOGGED_OUT', () => window.location.reload());




    // create the auth manager (when await is not used, )
    let manager = await Instantiator.getAuthManager();

    // create the header manager
    Instantiator.headerManager();

    // depending on the page, we create the correct view
    switch (docName) {
        case 'posign':
        case 'index':
            Instantiator.index(manager);
            break;
        case 'signing':
            Instantiator.signing(manager);
            break;
        case 'signedList':
            Instantiator.signedList(manager);
            break;
        case 'login':
            Instantiator.loginView(manager);
            break;
    }

}

