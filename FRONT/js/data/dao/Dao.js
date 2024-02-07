class Dao {
    constructor(endpoint) {
        // set the url of the api
        this.url = "http://http://slanlp0033.ad.ponet/charteapi/";
        
        // check if the endpoint is defined
        if (endpoint === undefined) {
            throw new Error("You must provide an endpoint");
        }

        // set the endpoint
        this.endpoint = endpoint;
    }

    async getAll() {
        let response = await fetch(this.url + this.endpoint);
        let data = await response.json();
        return data;
    }

    async getById(id) {
        let response = await fetch(this.url + this.endpoint + "/" + id);
        let data = await response.json();
        return data;
    }

    async add(data) {
        let response = await fetch(this.url + this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        let result = await response.json();
        return result;
    }

    async update(data) {
        let response = await fetch(this.url + this.endpoint + "/" + data.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        let result = await response.json();
        return result;
    }

    async delete(id) {
        let response = await fetch(this.url + this.endpoint + "/" + id, {
            method: 'DELETE'
        });
        let result = await response.json();
        return result;
    }
}