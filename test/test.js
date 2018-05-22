const assert = require("assert");
const server = require("../server");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);
let token;

describe("/POST login", ()=>{
	it("it should not POST a login without username and password", (done) => {
		let login = {
			username: "test",
			password: "test"
		};
		chai.request(server)
			.post("/login")
			.send(login)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});

});


describe("/POST api/createThumbnail", ()=>{
	it("it should not pass without token", function(done) {
		let url = "https://www.w3schools.com/w3css/img_fjords.jpg";
		chai.request(server)
			.post("/api/createThumbnail?url="+url)
			.set("x-access-token", token)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

});



describe("/PATCH jsonPatch", () => {
	it("it should not PATCH the request without authorization token", (done) => {
			
		let payload = {
			"obj":{
				"test":"test"
			},
            "patch": [{"op": "replace", "path": "/test", "value": "bar"},{"op": "add", "path": "/new", "value": "bar"}],
        };
		chai.request(server)
            .patch("/api/jsonPatch")
            .set("x-access-token", token)
			.send(payload)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.not.have.property("name").eql("JsonWebTokenError");				 
				done();
			});
	});

});