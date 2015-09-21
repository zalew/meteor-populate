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
  api.use('practicalmeteor:faker');
  api.use('underscore');
  api.use('mongo');
  api.addFiles([
    // 'lib/meteor-fill.js',
    // 'lib/meteor-populate.js',
    'lib/simple-schema-extension.js'
  ]);
  api.imply('aldeed:simple-schema');  
  api.imply('aldeed:collection2');
  api.export('Populate',['client','server']);
  api.export('Fill',['client','server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gbit:populate');
  api.addFiles('tests/meteor-populate-tests.js');
});
