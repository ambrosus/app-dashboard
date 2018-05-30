# angular-dashboard

Dashboard's Angular app documentation overview.

## Overview:

* [ angular.json, tsconfig.json ](#angularjson-tsconfigjson)
* [src/sass](#srcsass)
* [src/assets](#srcassets)
* [src/app](#srcapp)

## angular.json, tsconfig.json

Few things to note:

1. **Relative paths for .ts and .scss** file imports
 - *.scss* import relative path is set for src/sass in angular.json:\
`projects > dashboard > architect > build > options > styles > stylePreprocessorOptions > includePaths`
 - For *.ts* files, relative path (src as root) is set in tsconfig.json:\
`compilerOptions > baseUrl`
2. **scss** is a style extension\
`projects > dashboard > schematics > @schematics/angular:component`
3. **normalize.css** Normalize.css, latest version is put inside the styles before src/style.scss\
`projects > dashboard > architect > build > options > styles`
4. Tree shaking / build optimizations: **aot** is set to true and the **budgets** is added as well.\
`projects > dashboard > architect > build > configurations > production`

## src/sass

All the scss code is in the SASS folder.\
SASS folder is organized into different folders, each specific to the scss codes purpose.\
Each folder imports all of the scss files inside it in index.scss inside it.\
Then, all the index.scss files from every folder + sass/custom.scss is imported in sass/partials.scss, sass/partials file is imported in sass/style.scss, and then src/sass/style.scss is imported to src/style.scss which at the end gets compiled to the final css code for the app.

Folders are: 

1. Variables...\
This folder holds all SCSS regarding all the variables + some useful mixins, functions and placeholders (scss syntax).\
**Note:** only this folder is specifically imported to sass/var.scss file, so that we could use that file in angular components\
e.g. `@import 'var';`
2. Animation-Base\
All code for animations and additional reset necessary (additional to normalize.css), goes in this folder.
3. Layout\
Code that's used for features like buttons, forms, tabs, accordians, sidebar, what ever standalone feature, can be organized here in a specific file.
4. State\
Reusable classes for typography and other repeatable css code like: relative (class with css position: relative), overflow-h (overflow: hidden), etc.
5. Themes\
Code regarding the different themes for other features, e.g. .btn-solid-white, .btn-solid-orange

## src/assets

Assets folder holds all the media files.\
Organized as follows:
1. Favicons folder holds favicons.
2. Raster folder holds all the pixel type media files: .jpg, .jpeg, .png, .gif
3. Vector folder holds all vector type media files: .svg
4. Video folder holds all video type of files: .mp4

## src/app

App is organized into modules + services + interceptors.\
Overview per folder as follows:

1. **Core** (module)\
In core module we import all providers and basically anything we would otherwise import in app.module. This is to keep app.module clean and organized. When we import core module to app.module, it just imports everything in it as we would have had imported it in app.module in the first place.\
There's also not-found component in it, as it's a component that is globally used (displayed on not found pages).
2. **Shared** (module)\
Shared module holds all componenets, pipes and directives that are to be reused across entire app, in any module.\
e.g. `<app-spinner>, <app-header->, <app-footer>`\
Everything that's created in this module and is declared, is also exported so it can be used in other modules.\
In other modules we just import this module, and we can use it's shared components, directives and pipes.
3. **Services**
Have auth and data-storage service.
+ Auth service handles authentication of the user and its state.
+ Data storage service handles interaction with Ambrosus API, and its app state.
4. **Interceptors**
Handle interception of http requests. Useful for initiating and stopping youtube like loader indicator at the top, as an example.
5. **Modules**
This one is very important as this folder holds all other modules (features) of the entire app.
### Modular strategy, lazy loading, preloading
This app in the beginning has 2 main modules: Auth and Dashboard modules.
1. Auth module handles all the routes and components that deal with initial login / signup in the app.
2. Dashboard module handles all routes regarding usage of the dashboard.\
`/assets, /assets/new, /assets/123/events/123, /assets/123/events/new`\
Those are main get and post features of the dashboard.\
#### Lazy loading, preloading
Both modules are lazy loaded, with preloading strategy.\
**Note**\
As auth module is really the first thing user sees, it's loaded initially either way.\
As preloading strategy is set, other lazy loaded modules, in initial case dashboard module, is loaded in the background after the app initially loads. So dashboard routes are opened quickly after user logs in and gets access to dashboard part of the app.

