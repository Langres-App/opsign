/**
 * @class DocumentDao - Data Access Object for documents
 */
class DocumentDao extends Dao {
  /**
   * Create a new DocumentDao object to interact with the documents api
   */
  constructor() {
    // set the endpoint
    super('documents');
  }

  async add(doc) {
    console.log(doc);
    let response = await fetch(this.url + this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: doc
    });

    let result = await response.json();

    return result;
  }

  /**
   * Add a document to the database
   * @param {number} id Id of the document to get
   * @param {Version} versionToAdd Version to add to the document
   * @returns The result of the addVersion request
   */
  async addVersion(id, versionToAdd) {
    let response = await fetch(this.url + this.endpoint + '/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify(versionToAdd)
    });
    let result = await response.json();
    return result;
  }
}