var tap = require("tap")

var server = require("./lib/server.js")
var common = require("./lib/common.js")
var client = common.freshClient()

var password = "%1234@asdf%"
, username = "username"
, email = "i@izs.me"
, userdata = {
  name: username,
  email: email,
  _id: "org.couchdb.user:username",
  type: "user",
  roles: [],
  date: "2012-06-07T04:11:21.591Z" }
, SD = require("string_decoder").StringDecoder
, decoder = new SD()


tap.test("update a user acct", function (t) {
  server.expect("PUT", "/-/user/org.couchdb.user:username", function (req, res) {
    t.equal(req.method, "PUT")
    res.statusCode = 409
    res.json({error: "conflict"})
  })

  server.expect("GET", "/-/user/org.couchdb.user:username?write=true", function (req, res) {
    t.equal(req.method, "GET")
    res.json(userdata)
  })

  server.expect("PUT", "/-/user/org.couchdb.user:username/-rev/" + userdata._rev, function (req, res) {
    t.equal(req.method, "PUT")

    var b = ""
    req.on("data", function (d) {
      b += decoder.write(d)
    })

    req.on("end", function () {
      var o = JSON.parse(b)
      userdata.password = password
      userdata.date = o.date
      t.deepEqual(o, userdata)

      res.statusCode = 201
      res.json({created:true})
    })
  })

  client.adduser("http://localhost:1337/", username, password, email, function (er, data) {
    if (er) throw er
    t.deepEqual(data, { created: true })
    t.end()
  })
})
