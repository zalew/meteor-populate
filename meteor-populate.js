Populate = {
	
	//Verifica o percentual de semelhança entre duas palavras
	compareNames: function( word1, word2 ){
		
		var length1 = word1.length,
			length2 = word2.length,
			equivalency = 0;
		
		var minLength = (word1.length > word2.length) ? word2.length : word1.length;    
		var maxLength = (word1.length < word2.length) ? word2.length : word1.length;    
		
		for(var i = 0; i < minLength; i++)
			if(word1[i] == word2[i])
				equivalency++;
		
		return equivalency / maxLength;

	}

};


Meteor.Collection.prototype.populate = function(){
	
	var schema = this.simpleSchema();

	if(!schema) return;

	schema = schema._schema;
	console.log( schema );

}