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
    let response = await fetch(this.url + this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: doc
    });

    return response;
  }

  /**
   * Add a document to the database
   * @param {number} id Id of the document to get
   * @param {FormData} versionToAdd Version to add to the document as a FormData object
   * @returns The result of the addVersion request
   */
  async addVersion(id, versionToAdd) {
    let response = await fetch(this.url + this.endpoint + '/' + id, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: versionToAdd
    });

    return response;
  }
}