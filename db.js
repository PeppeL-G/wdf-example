const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("my-database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS humans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		age INTEGER
	)
`)

exports.getAllHumans = function(callback){
	
	const query = "SELECT * FROM humans ORDER BY id"
	
	db.all(query, function(error, humans){
		callback(error, humans)
	})
	
}

exports.createHuman = function(name, age, callback){
	
	const query = "INSERT INTO humans (name, age) VALUES (?, ?)"
	const values = [name, age]
	
	db.run(query, values, function(error){
		callback(error, this.lastID)
	})
	
}

exports.getHumanById = function(id, callback){
	
	const query = "SELECT * FROM humans WHERE id = ?"
	const values = [id]
	
	db.get(query, values, function(error, human){
		callback(error, human)
	})
	
}

exports.updateHumanById = function(newName, newAge, id, callback){
	
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
		callback(error)
	})
	
}

exports.deleteHumanById = function(id, callback){
	
	const query = "DELETE FROM humans WHERE id = ?"
	const values = [id]
	
	db.run(query, values, function(error){
		callback(error)
	})
	
}