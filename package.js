Package.describe({
  name: 'gbit:populate',
  version: '0.0.1',
  summary: 'Populate database with fake data using simpleSchema and Collection2 on Meteor',
  git: 'https://github.com/girassolbit/meteor-populate.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.imply('aldeed:simple-schema');
  api.imply('aldeed:collection2');
  api.use('digilord:faker');
  api.use('underscore');
  api.use('mongo');
  api.addFiles('meteor-populate.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gbit:populate');
  api.addFiles('meteor-populate-tests.js');
});
