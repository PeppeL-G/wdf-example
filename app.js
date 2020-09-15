const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const humans = [{
	id: 1,
	name: "Alice",
	age: 10
}, {
	id: 2,
	name: "Bob",
	age: 15
}]

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
	
	const model = {
		humans
	}
	
	response.render("humans.hbs", model)
	
})

app.get("/create-human", function(request, response){
	response.render("create-human.hbs")
})

app.post("/create-human", function(request, response){
	
	const name = request.body.name
	const age = request.body.age
	
	const human = {
		name,
		age,
		id: humans.length + 1
	}
	
	humans.push(human)
	
	response.redirect("/humans/"+human.id)
	
})

app.get("/update-human/:id", function(request, response){
	
	const id = request.params.id
	
	const human = humans.find(
		h => h.id == id
	)
	
	const model = {
		human
	}
	
	response.render("update-human.hbs", model)
	
})

app.post("/update-human/:id", function(request, response){
	
	const id = request.params.id
	const newName = request.body.name
	const newAge = request.body.age
	
	const human = humans.find(
		h => h.id == id
	)
	human.name = newName
	human.age = newAge
	
	response.redirect("/update-human/"+id)
	
})

app.post("/delete-human/:id", function(request, response){
	
	const id = request.params.id
	
	const humanIndex = humans.findIndex(
		h => h.id == id
	)
	
	humans.splice(humanIndex, 1)
	
	response.redirect("/humans")
	
})

app.get("/humans/:id", function(request, response){
	
	const id = request.params.id
	
	const human = humans.find(
		h => h.id == id
	)
	
	const model = {
		human
	}
	
	response.render("human.hbs", model)
	
})

app.listen(8080)