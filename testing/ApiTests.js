//Importing npm plugins
const bcrypt = require('bcryptjs');
var should = require('chai').should();
var expect = require('chai').expect;
var chai = require('chai'), chaiHttp = require('chai-http');
var salt = bcrypt.genSaltSync(10);
const pwd = bcrypt.hashSync("password", salt);

//Variables used by the tests
let token = ''; //'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibm9ybWFsdXNlciIsImlkIjoiNjIyNTJhYzFiYThmN2IyMTI0ODEzMDI0IiwiaWF0IjoxNjQ2NzY1MDY3LCJleHAiOjE2NDY4NTE0Njd9.FjP6lKklj-ziH5ItlVUlww8Z-lPMh0rV7FLjqN6_hIg';
let userIDCreated = -1;
let ticketIDCreated = -1;

//Enable the chai testing plugin
chai.use(chaiHttp);

//#region POST API TESTS

//Test the LOGIN POST API
describe('POST API: /login', () => {

    it('it should return invalid parameters error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Add proper parameter first!');
                done();
            });
    });

    it('it should invalid login details message', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .send({ "username": "invalidErrorUser", "password": "invalidPasswordUser" })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Username or password is incorrect!');
                done();
            });
    });

    it('it should log the client user type in', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .send({ "username": "normaluser", "password": pwd })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.be.eql('Login Successfully.');
                token = res.body.token;
                done();
            });
    });
});

//Test the REGISTER POST API
describe('POST API: /register', () => {

    it('it should return invalid parameters error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/register')
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Add proper parameter first!');
                done();
            });
    });

    it('it should return existing user error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/register')
            .send({ "username": "normaluser", "password": "password", "type": "Client" })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('UserName normaluser Already Exist!');
                done();
            });
    });

    it('it should register the user', (done) => {
        chai.request('http://localhost:2000')
            .post('/register')
            .send({ "username": "someuser", "password": "password", "type": "Client" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.title.should.be.eql('Registered Successfully.');
                userIDCreated = res.body.userID;
                done();
            });
    });
});

//Test the ADD TICKET API
describe('POST API: /add-ticket', () => {

    it('it should return invalid parameters error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/add-ticket')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Add proper parameter first!');
                done();
            });
    });

    it('it should return unathorized user message', (done) => {
        chai.request('http://localhost:2000')
            .post('/add-ticket')
            .set({ "token": "some random token" })
            .send({ "itemName": "Unit Test Created Item" })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return incorrect paramters message', (done) => {
        chai.request('http://localhost:2000')
            .post('/add-ticket')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Add proper parameter first!');
                done();
            });
    });

    it('it should add the ticket', (done) => {
        chai.request('http://localhost:2000')
            .post('/add-ticket')
            .set({ "token": token })
            .send({ "itemName": "Unit Test Created Item" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.title.should.be.eql('Ticket Added successfully.');
                ticketIDCreated = res.body.ticketID;
                done();
            });
    });
});

//Test the DELETE USER POST API
describe('POST API: /delete-user', () => {

    it('it should log the "admin" user type in', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .send({ "username": "adminuser", "password": pwd })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.be.eql('Login Successfully.');
                token = res.body.token;
                done();
            });
    });
    
    it('it should return invalid user error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-user')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return invalid id error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-user')
            .set({ "token": token })
            .send({ "id": -1456})
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Failed to delete!');
                res.body.status.should.be.eql(false);
                done();
            });
    });

    it('it should delete the user', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-user')
            .set({"token": token})
            .send({ "id": userIDCreated })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.errorMessage.should.be.eql('Deleted record!');
                userIDCreated = -1;
                done();
            });
    });

    it('it should log the client user type back in', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .send({ "username": "normaluser", "password": pwd })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.be.eql('Login Successfully.');
                token = res.body.token;
                done();
            });
    });
});

//Test the DELETE TICKET POST API
describe('POST API: /delete-ticket', () => {

    it('it should return invalid parameters error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-ticket')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return invalid id error message', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-ticket')
            .set({ "token": token })
            .send({ "id": -1456})
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Failed to delete!');
                res.body.status.should.be.eql(false);
                done();
            });
    });

    it('it should delete the ticket', (done) => {
        chai.request('http://localhost:2000')
            .post('/delete-ticket')
            .set({ "token": token })
            .send({ "id": ticketIDCreated })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.errorMessage.should.be.eql('Deleted record!');
                ticketIDCreated = -1;
                done();
            });
    });
});
//#endregion


//#region GET API TESTS

//Test the GET TICKET GET API
describe('GET API: /get-tickets', () => {

    it('it should return invalid user message', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-ticket')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return all tickets on system', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-ticket')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.tickets.should.be.a('array');
                done();
            });
    });
});

//Test the GET USERS GET API
describe('GET API: /get-users', () => {

    it('it should return invalid user message', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-users')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return all users on system', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-users')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.users.should.be.a('array');
                done();
            });
    });
});

//Test the SEARCH USERS GET API
describe('GET API: /search-users', () => {

    it('it should return invalid user message', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-users')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return invalid search term message', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-users')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Incorrect search term!');
                done();
            });
    });

    it('it should return client user types users', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-users')
            .set({ "token": token })
            .query({ search: "Client" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.status.should.be.eql(true);
                res.body.users.should.be.a('array');
                done();
            });
    });
});

//Test the SEARCH TICKETS GET API
describe('GET API: /search-tickets', () => {

    it('it should return invalid user message', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-tickets')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return invalid search term message', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-tickets')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.errorMessage.should.be.eql('Incorrect search term!');
                done();
            });
    });

    it('it should return client user types users', (done) => {
        chai.request('http://localhost:2000')
            .get('/search-tickets')
            .set({ "token": token })
            .query({ search: "normaluser" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.status.should.be.eql(true);
                res.body.tickets.should.be.a('array');
                done();
            });
    });
});

//Test the GET MYTICKETS GET API
describe('GET API: /get-mytickets', () => {

    it('Login as an admin user to change the token auth', (done) => {
        chai.request('http://localhost:2000')
            .post('/login')
            .send({ "username": "employeeuser", "password": pwd })
            .end((err, res) => {
                res.should.have.status(200);
                token = res.body.token;
                done();
            });
    });

    it('it should return invalid user token', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-mytickets')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.errorMessage.should.be.eql('User unauthorized!');
                done();
            });
    });

    it('it should return tickets for the given user - "employeeuser"', (done) => {
        chai.request('http://localhost:2000')
            .get('/get-mytickets')
            .set({ "token": token })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.status.should.be.eql(true);
                res.body.tickets.should.be.a('array');
                done();
            });
    });
});
//#endregion
