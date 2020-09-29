const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const humansRouter = require('./routers/humansRouter')

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "abc123"

const app = express()

app.engine(".hbs", expressHandlebars({
	defaultLayout: "main.hbs",
	extname: "hbs"
}))

app.use(express.static("static"))

app.use(bodyParser.urlencoded({
	extended: false
}))

app.use(expressSession({
	secret: "sdfkljwerlkjwer",
	saveUninitialized: false,
	resave: false,
	store: new SQLiteStore({
		db: "sessions.db"
	})
}))

app.use(function(request, response, next){
	response.locals.isLoggedIn = request.session.isLoggedIn
	next()
})

app.use("/humans", humansRouter)

app.get("/", function(request, response){
	response.render("start.hbs")
})

app.get("/about", function(request, response){
	response.render("about.hbs")
})

app.get("/login", function(request, response){
	response.render("login.hbs")
})

app.post("/login", function(request, response){
	
	const enteredUsername = request.body.username
	const enteredPassword = request.body.password
	
	if(enteredUsername == ADMIN_USERNAME && enteredPassword == ADMIN_PASSWORD){
		request.session.isLoggedIn = true
		response.redirect("/")
	}else{
		// TODO: Don't redirect, display error message instead.
		response.redirect("/humans")
	}
	
})

// TODO: Logging out should be a POST request.
app.get("/logout", function(request, response){
	request.session.isLoggedIn = false
	response.redirect("/")
})

app.listen(8080)