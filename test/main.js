/**
 * Copyright (c) 2017-2019, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

// To skip a test, either use 'xit' instead of 'it', or 'describe.skip' instead of 'describe'

const { co } = require('core-async')
const { assert } = require('chai')
const { compile } = require('../src')
const path = require('path')

const correct_01 = 
`<!DOCTYPE html>
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
</html>`

const correct_02 = 
`<!DOCTYPE html>
<html>
<head>
	<title></title>
	<meta charset="utf-8" >
	<meta name="version" content="">
</head>
<body>
	<h1>First blog post</h1>
	<p>Lorem ipsum</p>
</body>
</html>`

const correct_03 = 
`<!DOCTYPE html>
<html>
<head>
	<title>Hello page</title>
	<meta charset="utf-8" >
	<meta name="version" content="0.0.1">
</head>
<body>
	<h1>Second blog post</h1>
	<p>Lorem ipsum lorem ipsum</p>
</body>
</html>`

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

describe('#compile', () => {
	it('01 - Should fetch a local template and replace its tokens.', done => {
		co(function *() {
			const compiledFile01 = yield compile({
				template: path.join(__dirname, './templates/t01.html'),
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
			})
			const compiledFile02 = yield compile({
				template: path.join(__dirname, './templates/t01.html'),
				data: {
					project: {
						blog: {
							title: 'First blog post',
							content: '<p>Lorem ipsum</p>'
						}
					}
				}
			})

			assert.equal(compiledFile01, correct_01, '01')
			assert.equal(compiledFile02, correct_02, '01')

			done()
		}).catch(done)
	})
	it('02 - Should support defaulting missing data values.', done => {
		co(function *() {
			const compiledFile03 = yield compile({
				template: path.join(__dirname, './templates/t01.html'),
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
			})

			assert.equal(compiledFile03, correct_03, '01')

			done()
		}).catch(done)
	})
	it('03 - Should support string template rather then path to template.', done => {
		co(function *() {
			const compiledFile01 = yield compile({
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
			})

			assert.equal(compiledFile01, correct_01, '01')

			done()
		}).catch(done)
	})
	it('03 - Should support custom delimiters.', done => {
		co(function *() {
			const compiledFile01 = yield compile({
				template: path.join(__dirname, './templates/t02.html'),
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
				},
				delimiters: { open:'{{{', close: '}}}' }
			})

			assert.equal(compiledFile01, correct_01, '01')

			done()
		}).catch(done)
	})
})









