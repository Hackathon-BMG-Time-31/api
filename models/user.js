var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	nome: {
		type: String		
	},
	cpf: {
		type: String,
		index:true
	},
	email: {
		type: String
	},
	rg: {
		type: String
	},
	data_nascimento: {
		type: String
	},
	senha: { 
		type: String
	 }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.senha, salt, function(err, hash) {
	        newUser.senha = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByCpf = function(cpf, callback){
	var query = {cpf: cpf};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}