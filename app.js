const express = require('express')
const expressHandlebars = require('express-handlebars')

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