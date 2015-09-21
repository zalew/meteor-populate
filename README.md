Meteor Populate
===============
Populate your database filling with fake datas using simpleSchema and Collection2 on Meteor


## Installation

```bash
> meteor add gbit:populate
```

# How to use

## In Meteor Collections

```js

Meteor.startup(function(){
	// Say how much fakes you need
	// Default is 3
	Populate.amount = 5;

	Products.populate();
	// You can pass argument with number of fakes
	Users.populate(3);
	// Return 3 fake users and insert in your db if is empty
});

```

## You Can Personalize de fake in SimpleSchema Definitions (optional)

Meteor populate use [faker.js](https://github.com/marak/Faker.js/) to fill fields

```js

var Users =	new SimpleSchema({
	name: {
		type: String,
		fill: faker.METHOD.NAME
	},
	email: {
		type: String,
		fill: function(){
			return Users.findOne().email; 
		}
	}
});

```