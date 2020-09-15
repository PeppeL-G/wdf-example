const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')

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
	defaultLayout: "main.hbs"
}))

app.use(express.static("static"))

app.use(bodyParser.urlencoded({
	extended: false
}))

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
	const age = request.body.age
	
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
	const newAge = request.body.age
	
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

app.listen(8080)