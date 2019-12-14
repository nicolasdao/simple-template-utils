/*
 * Copyright (C) 2017-2019 Neap Pty Ltd nic@neap.co
 * 
 * This file is part of the fairplay-cms project. 
 * 
 * The fairplay-cms project can not be copied and/or distributed without the express
 * permission of Neap Pty Ltd nic@neap.co.
 */

const { co } = require('core-async')
const fs = require('fs')
const { extname, resolve } = require('path')
const repos = require('./repos')

const _merge = (...objs) => objs.reduce((acc, obj) => { //Object.assign(...objs.map(obj => JSON.parse(JSON.stringify(obj))))
	obj = obj || {}
	if (typeof(obj) != 'object' || Array.isArray(obj) || (obj instanceof Date))
		return acc
	
	Object.keys(obj).forEach(property => {
		const val = obj[property]
		const originVal = acc[property]
		const readyToMerge = !originVal || !val || typeof(val) != 'object' || Array.isArray(val) || typeof(originVal) != 'object' || Array.isArray(originVal)
		acc[property] = readyToMerge ? val : _merge(originVal, val)	
	})

	return acc
}, {})

/**
 * Gets a file under a Google Cloud Storage's 'filePath'.
 * 
 * @param  {String}  filePath 	Absolute file path on the local machine
 * @return {String}
 */
const _readFile = filePath => new Promise((onSuccess, onFailure) => fs.readFile(resolve(filePath), (err, data) => err ? onFailure(err) : onSuccess(data.toString())))


/**
 * Extracts tokens from an HTML template. 
 * 
 * @param  {String} template 			HTML template
 * @param {String} 	delimiters.open		Optional, default '{{'.
 * @param {String} 	delimiters.close	Optional, default '}}'.
 * 
 * @return {String} output[].token  e.g., 'project.name'
 * @return {String} output[].ref  	Reference as it appears in the HTML 'template' (e.g., '{{ project.name }}')
 */
const _getTokens = (template, delimiters) => {
	const rx = new RegExp(`${delimiters.open}(.*?)${delimiters.close}`, 'g')
	return ((template || '').match(rx) || []).filter(v => v).map(v => {
		const token = v.replace(/[{}\s]/g, '')
		return {
			token,
			ref: v
		}
	})
}

const _getData = (dataPath, defaultData, masterData, localFilesRepo) => co(function *(){
	defaultData = defaultData || {}
	masterData = masterData || {}
	if (dataPath && extname(dataPath) != '.json')
		throw new Error('Wrong argument exception. \'dataPath\' must be a json file.')

	const fileExists = dataPath ? yield localFilesRepo.exists(dataPath) : false
	const localData = fileExists ? yield localFilesRepo.getJSON(dataPath) : {}
	return _merge(defaultData, localData, masterData)
})

const _getValue = (obj,prop) => {
	if (!obj || !prop)
		return 
	return prop.split('.').reduce((acc,p) => acc && p ? acc[p] : acc, obj)
}

const _compile = (template, data, delimiters) => {
	data = data || {}
	template = template || ''
	return _getTokens(template, delimiters).reduce((acc, { token, ref }) => {
		const val = _getValue(data, token) || ''
		return acc.replace(ref,val)
	}, template)
}

const _isFile = (s, openDelimiter) => {
	const rx = new RegExp(`(\\n|${openDelimiter})`)
	return !(!s || typeof(s) != 'string' || rx.test(s))
}

/**
 * Breaks down the HTML between its layout metadata and its raw HTML content.
 * 
 * @param  {String} filePath 			Absolute HTML file path.
 * @param  {Object} mockLocalFilesRepo	Optional object used to unit test this function.
 * 
 * @yield  {Object} output.layout   	Layout object
 * @yield  {String} output.html   		HTML content without layout info
 */
const breakDownHTMltemplate = ({ filePath, mockLocalFilesRepo }) => co(function *() {
	const localFilesRepo = mockLocalFilesRepo || repos.localFiles
	const buf = yield localFilesRepo.read(filePath)
	const content = buf ? buf.toString().trim() : ''
	// 1. If there is no layout, return immediately
	if (!/^---/.test(content))
		return { layout:null, html:content }

	let layout = {}
	try {
		const [,ly] = content.split('---')
		layout = JSON.parse(ly) || {}
	} catch(e) {
		throw new Error(`Invalid layout format in file ${filePath}. The layout must be formatted using JSON`)
	}
	const [,,...rest] = content.split('---')
	const html = rest.join('---')
	return { layout, html }
})

/**
 * Fills the 'template' with values. 
 * 
 * @param {String} 			template 			Template string content or template's local path location.
 * @param {String|Object}	data 				Data to fill the template with or path to a JSON file containing data.
 * @param {Object} 			defaultData 		Optional object used to default properties if the object located under 'data' does not exist.
 * @param {Object} 			masterData 			Optional object used to override properties in the object located under 'data' and 'defaultData'.
 * @param {String} 			delimiters.open		Optional, default '{{'.
 * @param {String} 			delimiters.close	Optional, default '}}'.
 * @param {Object} 			mockLocalFilesRepo	Optional object used to unit test this function.
 * 
 * @yield {String} 			output 			Original 'template' with all values replaced with data contained in 'data' and 'data'
 */
const compileTemplate = ({ template, data, defaultData, masterData, delimiters, mockLocalFilesRepo }) => co(function *(){
	const localFilesRepo = mockLocalFilesRepo || repos.localFiles
	if (!template)
		return ''

	delimiters = delimiters || {}
	delimiters.open = delimiters.open || '{{'
	delimiters.close = delimiters.close || '}}'
	
	// Gets the template's content
	const t = _isFile(template, delimiters.open) ? yield _readFile(template) : template


	// Gets the data
	const _data = _isFile(data, delimiters.open) 
		? yield _getData(data, defaultData, masterData, localFilesRepo) 
		: _merge(defaultData||{}, data||{}, masterData||{})
	return _compile(t, _data, delimiters)
})

module.exports = {
	compile:compileTemplate,
	breakDown: breakDownHTMltemplate
}




