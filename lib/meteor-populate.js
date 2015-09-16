//faker.locale = Meteor.settings.locale || 'pt_BR';

Populate = {

	_createVoidObject: function( list, object ){
		var isObject = {},
			self = this;

		_.each( list, function( name ){
			if( (/\./).test( name ) ){
				var parent = name.split(/\.(.+)/);
				if( !isObject.hasOwnProperty( parent[0] ) )
					isObject[parent[0]] = [];

				isObject[parent[0]].push( parent[1]);
			} else { 
				object[name] = undefined;
			}
		});

		_.each( isObject, function( list, name ){
			if( list[0] == '$' ){
				object[name] = [];
			} else {
				object[name] = {};
				self._createVoidObject( list, object[name] );
			}
		});
	},

	_createVoidFake: function( schema ){
		var voidFake = {};
		this._createVoidObject( schema._schemaKeys, voidFake);
		return voidFake;
	},

	_loopToFields: function( fake, schema, context ){
		var self = this;
		context = context ? context + '.' : '';

		_.each( fake, function( value, field ){
			// Normal fields
			if( !value ){
				fake[field] = self.valueFromField( field, schema[ context + field], schema);
			} else {
				if( value.constructor == Object ){
					self._loopToFields(fake[field], schema, context + field);
				} else if( value.constructor == Array ){
					fake[field] = self.valueFromField( field, schema[ context + field ], schema);
				}
			}
		});	
	},

	fakeFromSchema: function( schema ){
		
		var fake = this._createVoidFake( schema ),
			self = this;

		self._loopToFields(fake, schema._schema);

		return fake;
	},

	valueFromField: function( name, field, schema ){
		
		var valueToReturn,
			self = this;

		if( field.type == String )
			valueToReturn = self._valueFrom.string(name, field);
		else if( field.type == Number )
			valueToReturn = self._valueFrom.number(field);
		else if( field.type == Boolean )
			valueToReturn = self._valueFrom.boolean();
		else if( field.type == Date )
			valueToReturn = self._valueFrom.date(field);
		else if( field.type == Array ){

			var minCount = 1,
				maxCount = 5;
			
			if( field.hasOwnProperty( 'minCount' ) )
				minCount = field.minCount;
			
			if( field.hasOwnProperty( 'maxCount' ) )
				maxCount = field.maxCount;

			valueToReturn = [];

			var type = schema[ name + '.$' ] && schema[ name + '.$' ].type;
			
			console.log(type);

			_( _.random(minCount, maxCount) ).times(function(){
				if( type == Object )
					valueToReturn.push({});
				else 
					valueToReturn.push( self.valueFromField( name, { type: field.type[0] } ) );
			});

		}
		
		return valueToReturn;
	},

	_valueFrom: {
		string: function(name, field){
	
			var toReturn = faker.internet.userName();

			if( (/(user(name)?|name)/i).test( name ) )
				toReturn = faker.name.findName();

			if( (/email/i).test( name ) )
				toReturn = faker.internet.email();

			if( (/number/i).test( name ) )
				toReturn = faker.random.number() + '';

			if( (/image/i).test(name) )
				toReturn = faker.image.image();

			if( (/description/i).test(name) )
				toReturn = faker.lorem.sentence();

			if( (/color/i).test(name) )
				toReturn = faker.internet.color();

			if( (/(code|password|id)/i).test(name) )
				toReturn = Random.id();

			return toReturn;
		},
		number: function( field ){
			return _.random( field.min || 0, field.max || 1000 );
		},
		boolean: function(){
			return _.sample([true,false]);
		},
		date: function(field){
			return faker.date.between( field.min || new Date(10000000), field.max || new Date(9999999999999999)  );
		}
	}
};


Meteor.Collection.prototype.populate = function( number ){
	
	var schema = this.simpleSchema(),
		number = Meteor.settings.populate || number || 1,
		toReturn = [];

	if(!schema) return;

	_(number).times(function(){
		toReturn.push( Populate.fakeFromSchema( schema ) );
	});

	return toReturn.length == 1 ? toReturn[0]: toReturn;
};