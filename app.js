const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine(".hbs", expressHandlebars({
	defaultLayout: "main.hbs"
}))

app.get("/", function(request, response){
	
	const model = {
		hello: "hi!"
	}
	
	response.render("start.hbs", model)
})

app.listen(8080)