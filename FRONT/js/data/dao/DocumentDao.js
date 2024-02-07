class DocumentDao extends Dao {
  constructor() {
    super('documents');
    this.documents = [];
  }

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