![alt text](https://cdn-images-1.medium.com/max/1600/1*hGJHnXJuOmfjIcEofbC0Ww.png "Ambrosus")

# Ambrosus Dashboard Module

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 3 versions| last 3 versions| last 3 versions| last 3 versions| last 3 versions

[![Build Status](https://travis-ci.com/ambrosus/app-dashboard.svg?token=tMTWCoK9SU2CizZxjcNz&branch=dev)](https://travis-ci.com/ambrosus/app-dashboard)

Dashboard's Angular app documentation overview.

## Overview:

* [Development](#development)
* [Deployment](#deployment)
* [Dashboard API (node server)](#dashboard-api-node-server)
* [Angular app](#angular-app)



### Development

1. Download
```
git clone https://github.com/ambrosus/app-dashboard.git
```
2. Start node server (dashboard API)
```
node server.js
```
3. Run Angular app
```
npm run dev
```


### Deployment

There are 3 different deployment versions:

1. Everything pushed on 'dev' branch. \
**Purpose:** for developing new app features.

    https://ambrosus-dev-dashboard.herokuapp.com

2. Everything pushed on 'master' branch. \
**Purpose:** for testing, staging before production.

    https://ambrosus-test-dashboard.herokuapp.com

3. Code from 'master' manually promoted to production. \
**Purpose:** production version.

    https://dashboard.ambrosus.com


### Dashboard API (node server)

Node API service for handling account management. \
**Database**: /server/accounts.json 

#### API

***SIGNUP***

**Description:** \
Account registration. Creates an account for a user, where he can use email and password to login, instead of address and secret. Takes address and secret, encrypts it using users password and stores it as a token.

**Request:**

```
POST /api/auth/signup
```

Body | Type | Required
-----|------|---------
address | string | true
secret | string | true
email | string | true
password | string | true
full_name | string | false
company | string | false

**Responses:**

**200** *Signup successful* <br>

**401** *Address is missing* <br>
**401** *Secret is missing* <br>
**401** *E-mail is missing* <br>
**401** *Password is missing* <br>
**401** *Account already exists*

***LOGIN***

**Description:** \
Takes email and password, decrypts the token using users password, if successful returns address and secret to the user.

**Request:**

```
POST /api/auth/login
```

Body | Type | Required
-----|------|---------
email | string | true
password | string | true

**Responses:**

**200** 
```
  {
    address,
    secret
  }
```

**401** *E-mail is missing* <br>
**401** *Password is missing* <br>
**401** *Password is incorrect* <br>
**401** *Account does not exists*

***RESET PASSWORD***

**Description:** \
Takes email, current password and new password, decrypts the token with the current password, then, address and secret are encrypted back with the new password and stored as token.

**Request:**

```
POST /api/auth/resetpassword
```

Body | Type | Required
-----|------|---------
email | string | true
oldPassword | string | true
password | string | true

**Responses:**

**200** *Reset password succesfull* <br>

**401** *Reset password failed* <br>
**401** *Password is incorrect* <br>
**401** *E-mail is missing* <br>
**401** *Old password is missing* <br>
**401** *Password is missing* <br>
**401** *Account does not exists*

***ACCOUNTS***

**Description:** \
Returns all of the accounts from accounts.json

**Request:**

```
GET /api/auth/accounts
```

**Responses:**

**200**
```
{
  resultsCount: number,
  data: [
    {
      full_name,
      address
    }
  ],
  message: 'Success'
}
```

**404** *No accounts* 

***ACCOUNT***

**Description:** \
Returns data of a specific account.

**Request:**

```
GET /api/auth/accounts/:address
```

**Responses:**

**200**
```
{
  data: {
    token,
    full_name,
    company,
    email,
    address
  },
  message: 'Success'
}
```

**404** *No account* 

***CLEAN***

**Description:** \
Removes all accounts from /server/accounts.json

**Request:**

```
DELETE /api/auth/accounts
```

**Responses:**

**200** *Cleanup successful*

**400** *Cleanup failed* <br>
**404** *No accounts* 


### Angular app:

App is organized into modules and services.

**Modules:**

1. **Core** \
In core module we import all providers and basically anything we would otherwise import in app.module. This is to keep app.module clean and organized. When we import core module to app.module, it just imports everything in it as we would have had imported it in app.module in the first place.\
Contains globally used components: Not Found, About, Terms, Settings and Help.
2. **Shared** \
Shared module holds all componenets, pipes and directives that are to be reused across entire app, in any module.\
e.g. `<app-spinner>, <app-header>, <app-footer>`\
Everything that's created in this module and is declared, is also exported so it can be used in other modules.\
In other modules we just import this module, and we can use it's shared components, directives and pipes.
3. **Auth** \
Handles authentication part of the app, has login, sign in and sign up components.
4. **Dash** \
Handles the core functionality of the dashboard. \
Contains: assets, asset, event, asset-add, event-add and dashboard components.

**Services**

1. **Auth** handles all processing related to authentication of the user.
2. **Storage** wrap for any localStorage interaction.
3. **Assets** handles all the processing regarding, getting, parsing and creating new assets and events, and interaction with Ambrosus SDK.
4. **Interceptor** handles interception of http requests.\
Adds the secret or token from localStorage in the headers.

### Modular strategy and Angular PWA
* Dashboard angular app is converted to Angular PWA, which uses advance strategies for caching various assets and preloading them when possible.
* Lazy loading is setup as well, dash and auth modules are lazy loaded.

