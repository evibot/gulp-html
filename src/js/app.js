'use strict';

var angular = require('angular');
var greet = require('./modules/greetings.js');
greet('Test');

var app = angular.module('app', []);
