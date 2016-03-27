# AngularJS Jasmine Boilerplate Sublime Package

Generates boilerplate [Jasmine](http://jasmine.github.io/) tests from [annotated](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation) [AngularJS](https://angularjs.org/) components via [Dgeni](https://github.com/angular/dgeni).

Depends on [`angular-jasmine-boilerplate`](https://github.com/namoscato/angular-jasmine-boilerplate).

## Installation

    cd ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/
    git clone https://github.com/namoscato/angular-jasmine-boilerplate-sublime.git
    cd angular-jasmine-boilerplate-sublime/
    npm install

## Usage

This package stores a reference to source and test paths on a per-project basis.

For each project, right click on the source and test folders in the sidebar and, under the "Jasmine Boilerplate" menu, click on "Set Source Folder" and "Set Test Folder" respectively.

Then, right click on an open file and click "Generate Jasmine Boilerplate".
