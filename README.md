# Simple Template Utils &middot; [![Tests](https://travis-ci.org/nicolasdao/template-emptyjs.svg?branch=master)](https://travis-ci.org/nicolasdao/template-emptyjs) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) [![Neap](https://neap.co/img/made_by_neap.svg)](#this-is-what-we-re-up-to)
__*Simple Template Utils*__ helps generating strings based on templates and input data.

# Table of Contents

> * [Install](#install)
> * [Getting started](#getting-started)
> * [FAQ](#faq)
>	- [How to define default values?](#how-to-define-default-values?)
>	- [Can I use a string template instead of the path to a template?](#can-i-use-a-string-template-instead-of-the-path-to-a-template)
> * [About Neap](#this-is-what-we-re-up-to)
> * [License](#license)

# Install

```
npm i simple-template-utils
```

# Getting started

Let's say there is a folder in the root folder called `template` with a file called `your-template.html` similar to this:

```html
<!DOCTYPE html>
<html>
<head>
	<title>{{ project.page.title}}</title>
	<meta charset="utf-8" >
	<meta name="version" content="{{     version }}">
</head>
<body>
	<h1>{{ project.blog.title }}</h1>
	{{project.blog.content}}
</body>
</html>
```

The following code in an `index.js`

```js
const path = require('path')
const template = require('simple-template-utils')

template.compile({
	template: path.join(__dirname, './template/your-template.html'),
	data: {
		version: '0.0.1',
		project: {
			page: {
				title: 'Hello page'
			},
			blog: {
				title: 'First blog post',
				content: '<p>Lorem ipsum</p>'
			}
		}
	}
}).then(console.log)
```

outputs this:

```html
<!DOCTYPE html>
<html>
<head>
	<title>Hello page</title>
	<meta charset="utf-8" >
	<meta name="version" content="0.0.1">
</head>
<body>
	<h1>First blog post</h1>
	<p>Lorem ipsum</p>
</body>
</html>
```

# FAQ
## How to define default values?

```js
template.compile({
	template: path.join(__dirname, './template/your-template.html'),
	data: {
		project: {
			blog: {
				title: 'Second blog post',
				content: '<p>Lorem ipsum lorem ipsum</p>'
			}
		}
	},
	defaultData: {
		version: '0.0.1',
		project: {
			page: {
				title: 'Hello page'
			},
			blog: {
				title: 'First blog post',
				content: '<p>Lorem ipsum</p>'
			}
		}
	}
}).then(console.log)
```

## Can I use a string template instead the path to a template?

Yes, you can.

```js
const template_01 = 
`<!DOCTYPE html>
<html>
<head>
	<title>{{ project.page.title}}</title>
	<meta charset="utf-8" >
	<meta name="version" content="{{     version }}">
</head>
<body>
	<h1>{{ project.blog.title }}</h1>
	{{project.blog.content}}
</body>
</html>`

template.compile({
	template: template_01,
	data: {
		version: '0.0.1',
		project: {
			page: {
				title: 'Hello page'
			},
			blog: {
				title: 'First blog post',
				content: '<p>Lorem ipsum</p>'
			}
		}
	}
}).then(console.log)
```

# This Is What We re Up To
We are Neap, an Australian Technology consultancy powering the startup ecosystem in Sydney. We simply love building Tech and also meeting new people, so don't hesitate to connect with us at [https://neap.co](https://neap.co).

Our other open-sourced projects:
#### GraphQL
* [__*graphql-s2s*__](https://github.com/nicolasdao/graphql-s2s): Add GraphQL Schema support for type inheritance, generic typing, metadata decoration. Transpile the enriched GraphQL string schema into the standard string schema understood by graphql.js and the Apollo server client.
* [__*schemaglue*__](https://github.com/nicolasdao/schemaglue): Naturally breaks down your monolithic graphql schema into bits and pieces and then glue them back together.
* [__*graphql-authorize*__](https://github.com/nicolasdao/graphql-authorize.git): Authorization middleware for [graphql-serverless](https://github.com/nicolasdao/graphql-serverless). Add inline authorization straight into your GraphQl schema to restrict access to certain fields based on your user's rights.

#### React & React Native
* [__*react-native-game-engine*__](https://github.com/bberak/react-native-game-engine): A lightweight game engine for react native.
* [__*react-native-game-engine-handbook*__](https://github.com/bberak/react-native-game-engine-handbook): A React Native app showcasing some examples using react-native-game-engine.

#### Authentication & Authorization
* [__*userin*__](https://github.com/nicolasdao/userin): UserIn let's App engineers to implement custom login/register feature using Identity Providers (IdPs) such as Facebook, Google, Github. 

#### General Purposes
* [__*core-async*__](https://github.com/nicolasdao/core-async): JS implementation of the Clojure core.async library aimed at implementing CSP (Concurrent Sequential Process) programming style. Designed to be used with the npm package 'co'.
* [__*jwt-pwd*__](https://github.com/nicolasdao/jwt-pwd): Tiny encryption helper to manage JWT tokens and encrypt and validate passwords using methods such as md5, sha1, sha256, sha512, ripemd160.

#### Google Cloud Platform
* [__*google-cloud-bucket*__](https://github.com/nicolasdao/google-cloud-bucket): Nodejs package to manage Google Cloud Buckets and perform CRUD operations against them.
* [__*google-cloud-bigquery*__](https://github.com/nicolasdao/google-cloud-bigquery): Nodejs package to manage Google Cloud BigQuery datasets, and tables and perform CRUD operations against them.
* [__*google-cloud-tasks*__](https://github.com/nicolasdao/google-cloud-tasks): Nodejs package to push tasks to Google Cloud Tasks. Include pushing batches.

# License
Copyright (c) 2017-2019, Neap Pty Ltd.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Neap Pty Ltd nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL NEAP PTY LTD BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

<p align="center"><a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_color_horizontal.png" alt="Neap Pty Ltd logo" title="Neap" height="89" width="200"/></a></p>
