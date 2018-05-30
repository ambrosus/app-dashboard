# angular-dashboard

Dashboard's Angular app documentation overview.

## Overview:

* [ angular.json, tsconfig.json ](angularjsontsconfigjson)
* src/sass
* src/assets
* src/app

## angular.json, tsconfig.json

Angular.json holds some specific configuration for the Angular app.\
Few things to note:

1. **Relative paths for .ts and .scss** file imports
* *.scss* import relative path is set for src/sass in angular.json:
`projects > dashboard > architect > build > options > styles > stylePreprocessorOptions > includePaths`
* For *.ts* files, relative path (src as root) is set in tsconfig.json:
`compilerOptions > baseUrl`
2. **scss** is a style extension\
`projects > dashboard > schematics > @schematics/angular:component`
3. **normalize.css** Normalize.css, latest version is put inside the styles before src/style.scss\
`projects > dashboard > architect > build > options > styles`
4. Tree shaking / build optimizations: **aot** is set to true and the **budgets** is added as well.\
`projects > dashboard > architect > build > configurations > production`
5. 
