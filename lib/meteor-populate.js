if( !Meteor.settings ) Meteor.settings = {};

var RandExp = Npm.require('randexp');

faker.locale = Meteor.settings.locale || 'en';

/**
 * @namespace Populate
 * @summary The singleton to organize methods to populate database.
 */
Populate = {
/**
 * @summary Create a void object from a list of fields.
 * @param {Array} list The list of fields to be created
 * @param {Object} object The object "pointer" to save created fields
 */
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
/**
 * @summary Create a void fake.
 * @param {Object} schema The SimpleSchema._schema object
 */
	_createVoidFake: function( schema ){
		var voidFake = {};
		this._createVoidObject( schema._schemaKeys, voidFake);
		return voidFake;
	},
/**
 * @summary A loop to create recursively fields from SimpleSchema
 * @param {Object} fake Object to save data
 * @param {Object} schema The SimpleSchema to be generated fake
 * @param {String} context The context name ex: 'payment' ( to be recursive )
 */
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
/**
 * @summary The main function to create a fake from a SimpleSchema
 * @param {Object} schema The SimpleSchema
 */
	fakeFromSchema: function( schema ){
		
		var fake = this._createVoidFake( schema ),
			self = this;

		self._loopToFields(fake, schema._schema);

		return fake;
	},
/**
 * @summary Select the eloquent fake generator to field
 * @param {String} name Name of field
 * @param {Object} field This field object getted from SimpleSchema
 * @param {Object} schema The SimpleSchema
 */
	valueFromField: function( name, field, schema ){
		
		var valueToReturn,
			self = this;

		if( field.hasOwnProperty( 'autoValue' ) && field.autoValue.constructor == Function )
			return field.autoValue();
		
		if( field.hasOwnProperty( 'allowedValues' ) && field.allowedValues.constructor == Array )
			return _.sample( field.allowedValues );
		
		if( field.hasOwnProperty('populate') && field.populate.constructor == Function ){
			return field.populate();
		}

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
			
			_( _.random(minCount, maxCount) ).times(function(){
				if( type == Object )
					valueToReturn.push({});
				else 
					valueToReturn.push( self.valueFromField( name, field, schema ) );
			});

		}
		
		return valueToReturn;
	},
/**
 * @summary Singleton to each type of fields
 */
	_valueFrom: {
		string: function(name, field){
	
			if( field.hasOwnProperty('regEx') )
				return new RandExp( field.regEx ).gen();

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

/**
* @summary Add method to Meteor.Collection
* @param {Number} number The number of fake to be generated
*/
Meteor.Collection.prototype.populate = function( number ){
	
	var schema = this.simpleSchema(),
		number = number || Meteor.settings.populate || 1,
		toReturn = [],
		self = this;

	if(!schema) return;

	_(number).times(function(){
		var fake = Populate.fakeFromSchema( schema );
		toReturn.push( fake );
	});

	return toReturn.length == 1 ? toReturn[0]: toReturn;
};

SimpleSchema.extendOptions({
	populate: Match.Optional(Function)
});