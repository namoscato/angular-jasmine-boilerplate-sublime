# AngularJS Jasmine Boilerplate Generation [![Build Status](https://travis-ci.org/namoscato/angular-jasmine-boilerplate.svg?branch=master)](https://travis-ci.org/namoscato/angular-jasmine-boilerplate)

Generates boilerplate [Jasmine](http://jasmine.github.io/) tests from [annotated](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation) [AngularJS](https://angularjs.org/) components via [Dgeni](https://github.com/angular/dgeni).

    angular-jasmine-boilerplate [--save] [--base-path=path] [--test-path=path] [--config=path] [--non-interactive] [--force] [file ...]

| Option | Type | Description |
|:------ |:---- |:----------- |
| `--save` | boolean | Saves the specified base and test paths to a `config.json` file in the root directory |
| `--base-path` | string | Absolute path to source directory |
| `--test-path` | string | Absolute path to test directory |
| `--config` | string | Path to configuration JSON file |
| `--non-interactive` | boolean | Disables interactive prompt when boilerplate file already exists, and immediately excludes file |
| `--force` | boolean | Forces the boilerplate to be generated, regardless of its previous existence |

## Usage

1. Install dependencies:

        npm install

2. Save relevant paths:

        angular-jasmine-boilerplate --save --base-path=/dev/project/src --test-path=/dev/project/tests

3. Generate Jasmine boilerplate:

        angular-jasmine-boilerplate session/session.service.js

    where the arguments are one or more paths to annotated AngularJS components, relative to `base-path`.

## Supports

* [controllers](https://docs.angularjs.org/guide/controller)
* [services](https://docs.angularjs.org/guide/providers#service-recipe)
