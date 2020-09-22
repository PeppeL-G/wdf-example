const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)

const HUMAN_NAME_MIN_LENGTH = 2
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "abc123"

const db = new sqlite3.Database("my-database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS humans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		age INTEGER
	)
`)

const app = express()

app.engine(".hbs", expressHandlebars({
	defaultLayout: "main.hbs",
	extname: "hbs"
}))

function getHumanValidationErrors(name, age){
	
	const validationErrors = []
	
	if(name.length < HUMAN_NAME_MIN_LENGTH){
		validationErrors.push("Name must be at least "+HUMAN_NAME_MIN_LENGTH+" characters.")
	}
	
	if(isNaN(age)){
		validationErrors.push("Age must be a number.")
	}else if (age < 0){
		validationErrors.push("Age must be 0 or greater.")
	}
	
	return validationErrors
	
}

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

app.get("/", function(request, response){
	response.render("start.hbs")
})

app.get("/about", function(request, response){
	response.render("about.hbs")
})

app.get("/humans", function(request, response){
	
	const query = "SELECT * FROM humans ORDER BY id"
	
	db.all(query, function(error, humans){
		
		if(error){
			
			console.log(error)
			
			const model = {
				dbErrorOccurred: true
			}
			
			response.render("humans.hbs", model)
			
		}else{
			
			const model = {
				humans,
				dbErrorOccurred: false
			}
			
			response.render("humans.hbs", model)
			
		}
		
	})
	
})

app.get("/create-human", function(request, response){
	response.render("create-human.hbs")
})

app.post("/create-human", function(request, response){
	
	const name = request.body.name
	const age = parseInt(request.body.age)
	
	const errors = getHumanValidationErrors(name, age)
	
	if(!request.session.isLoggedIn){
		errors.push("Must be logged in.")
	}
	
	if(0 < errors.length){
		const model = {
			errors,
			name,
			age
		}
		response.render("create-human.hbs", model)
		return
	}
	
	const query = "INSERT INTO humans (name, age) VALUES (?, ?)"
	const values = [name, age]
	
	db.run(query, values, function(error){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans/"+this.lastID)
		}
	})
	
})

app.get("/update-human/:id", function(request, response){
	
	const id = request.params.id
	
	const query = "SELECT * FROM humans WHERE id = ?"
	const values = [id]
	
	db.get(query, values, function(error, human){
		
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			
			const model = {
				human
			}
			
			response.render("update-human.hbs", model)
			
		}
		
	})
	
})

app.post("/update-human/:id", function(request, response){
	
	const id = request.params.id
	const newName = request.body.name
	const newAge = parseInt(request.body.age)
	
	const errors = getHumanValidationErrors(newName, newAge)
	
	if(!request.session.isLoggedIn){
		errors.push("Must be logged in.")
	}
	
	if(0 < errors.length){
		const model = {
			errors,
			human: {
				id,
				name: newName,
				age: newAge
			}
		}
		response.render("update-human.hbs", model)
		return
	}
	
	const query = `
		UPDATE
			humans
		SET
			name = ?,
			age = ?
		WHERE
			id = ?
	`
	const values = [newName, newAge, id]
	
	db.run(query, values, function(error){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans/"+id)
		}
	})
	
})

app.post("/delete-human/:id", function(request, response){
	
	const id = request.params.id
	
	// TODO: Add authorization.
	
	const query = "DELETE FROM humans WHERE id = ?"
	const values = [id]
	
	db.run(query, values, function(error){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans")
		}
	})
	
})

app.get("/humans/:id", function(request, response){
	
	const id = request.params.id
	
	const query = "SELECT * FROM humans WHERE id = ?"
	const values = [id]
	
	db.get(query, values, function(error, human){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			
			const model = {
				human
			}
			
			response.render("human.hbs", model)
			
		}
	})
	
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