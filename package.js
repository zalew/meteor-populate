Package.describe({
  name: 'gbit:populate',
  version: '0.0.1',
  summary: 'Populate database with fake data using simpleSchema and Collection2 on Meteor',
  git: 'https://github.com/girassolbit/meteor-populate.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use('aldeed:simple-schema');
  api.use('check');
  api.imply('aldeed:simple-schema');
  api.imply('aldeed:collection2');
  api.use('practicalmeteor:faker@3.0.1_1');
  api.use('underscore');
  api.use('check');
  api.use('mongo');
  api.use('random');
  api.addFiles('lib/meteor-populate.js', 'server');
  api.addFiles('lib/simple-schema-extension.js', ['client','server']);
  api.export('Populate',['client','server']);
  api.export('faker',['client','server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gbit:populate');
  api.addFiles('tests/meteor-populate-tests.js');
});

Npm.depends({
  'randexp': '0.4.0'
});