const express = require('express')
const db = require('../db')

const HUMAN_NAME_MIN_LENGTH = 2

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

const router = express.Router()


router.get("/", function(request, response){
	
	db.getAllHumans(function(error, humans){
		
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

router.get("/create", function(request, response){
	response.render("create-human.hbs")
})

router.post("/create", function(request, response){
	
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
	
	db.createHuman(name, age, function(error, id){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans/"+id)
		}
	})
	
})

router.get("/update/:id", function(request, response){
	
	const id = request.params.id
	
	db.getHumanById(id, function(error, human){
		
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

router.post("/update/:id", function(request, response){
	
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
	
	db.updateHumanById(newName, newAge, id, function(error){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans/"+id)
		}
	})
	
})

router.post("/delete/:id", function(request, response){
	
	const id = request.params.id
	
	// TODO: Add authorization.
	
	db.deleteHumanById(id, function(error){
		if(error){
			
			console.log(error)
			
			// TODO: Display error message.
			
		}else{
			response.redirect("/humans")
		}
	})
	
})

router.get("/:id", function(request, response){
	
	const id = request.params.id
	
	db.getHumanById(id, function(error, human){
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

module.exports = router