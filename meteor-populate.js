Populate = {

	_fakerCategories: [
		'address',
		'commerce',
		'company',
		'date',
		'finance',
		'hacker',
		'helpers',
		'image',
		'internet',
		'lorem',
		'name',
		'phone'		
	],

	//Compare equivalence of strings
	_compareNames: function( word1, word2 ){
		
		var length1 = word1.length,
			length2 = word2.length,
			equivalency = 0;
		
		var minLength = (word1.length > word2.length) ? word2.length : word1.length;    
		var maxLength = (word1.length < word2.length) ? word2.length : word1.length;    
		
		for(var i = 0; i < minLength; i++)
			if(word1[i] == word2[i])
				equivalency++;
		
		return equivalency / maxLength;

	},

	fakeFromSchema: function( schema ){
		
		var fake = {},
			objectField = {};

		_.each( schema , function( field, name ){

			if( field.hasOwnProperty( 'autoValue' ) && field.autoValue.constructor == Function ){
				fake[name] = field.autoValue();
				return;
			}

			if( field.hasOwnProperty( 'allowedValues' ) && field.allowedValues.constructor == Array ){
				fake[name] = _.sample( field.allowedValues );
				return;
			}

			if( field.type == Object )
				objectField[field.name] = {};
			
			if( field.type == Array )
				objectField[field.name] = [];

			if( (/\./).test( name ) ){
				var objectName = name.split('.');
				objectField[objectName[0]][objectName[1]] = _.extend(field, { name: objectName[1] });
			} else 
				fake[name] = Populate.valueFromField( name, field );
			
		});

		console.log( objectField);

		return fake;
	},

	valueFromField: function( name, field ){
		
		var valueToReturn;

		if(!field.type) return;

		if( field.type == String )
			valueToReturn = Populate._valueFrom.string(name, field);
		else if( field.type == Number )
			valueToReturn = Populate._valueFrom.number(field);
		else if( field.type == Boolean )
			valueToReturn = Populate._valueFrom.boolean();
		else if( field.type == Date )
			valueToReturn = Populate._valueFrom.date(field);
		else if( field.type.constructor == Array ){

			var minCount = 1,
				maxCount = 5;
			
			if( field.hasOwnProperty( 'minCount' ) )
				minCount = field.minCount;
			
			if( field.hasOwnProperty( 'maxCount' ) )
				maxCount = field.maxCount;

			valueToReturn = [];
			
			_( _.random(minCount, maxCount) ).times(function(){
				valueToReturn.push( valueFromField( name, { type: field.type[0] } ) );
			});

		} else if( field.type == Object ){
			valueToReturn = {};
		} else if( field.type == Array ){
			valueToReturn = [];
		}
		
		return valueToReturn;
	},

	_valueFrom: {
		string: function(name, field){
			
			var biggestEquivalency = 0,
				biggestCategoryName = '',
				biggestGeneratorName = '';

			_.each( faker, function( list, categoryName ){
				
				if( _.indexOf( Populate._fakerCategories, categoryName ) > -1 ){
					
					_.each( list, function( fakeGenerator, generatorName ){
						
						var percent = Populate._compareNames( name, generatorName );
						
						if( percent > biggestEquivalency && percent > 0.7 ){
							biggestCategoryName = categoryName;
							biggestGeneratorName = generatorName;
						}

					});
				
				}
			
			});

			if( !biggestCategoryName || !biggestGeneratorName ){
				biggestCategoryName = 'name';
				biggestGeneratorName = 'findName';
			}

			return faker[ biggestCategoryName ][ biggestGeneratorName ]();
		},
		number: function( field ){
			return _.random( field.min || 0, field.max || 1000 );
		},
		boolean: function(){
			return faker.random.boolean();
		},
		date: function(field){
			return faker.date.between( field.min || new Date(10000000), field.max || new Date(9999999999999999)  );
		}
	}
};


Meteor.Collection.prototype.populate = function( number ){
	
	var schema = this.simpleSchema(),
		number = number || 1,
		toReturn = [];

	if(!schema) return;

	schema = schema._schema;

	_(number).times(function(){
		toReturn.push( Populate.fakeFromSchema( schema ) );
	});

	return toReturn.length == 1 ? toReturn[0]: toReturn;
};