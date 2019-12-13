/*
 * Copyright (C) 2017-2019 Neap Pty Ltd nic@neap.co
 * 
 * This file is part of the fairplay-cms project. 
 * 
 * The fairplay-cms project can not be copied and/or distributed without the express
 * permission of Neap Pty Ltd nic@neap.co.
 */

// npm i rimraf fast-glob co
const { co } = require('core-async')
const fs = require('fs')
const { join, resolve } = require('path')
const rimraf = require('rimraf')
const fg = require('fast-glob')
	
/**
 * Checks if a file or folder exists
 * 
 * @param  {String}  filePath 	Absolute path to file or folder on the local machine
 * @return {Boolean}   
 */
const fileExists = filePath => new Promise(onSuccess => fs.exists(filePath, yes => onSuccess(yes ? true : false)))

/**
 * Creates a folder. 
 * 
 * @param  {String} folderPath Absolute folder path on the local machine
 * @return {Object}   
 */
const createFolder = folderPath => new Promise((onSuccess, onFailure) => fs.mkdir(folderPath, err => {
	if (!err || (err.message || '').indexOf('file already exists') >= 0)
		onSuccess(folderPath)
	else
		onFailure(err)
}))

/**
 * Deletes a folder or an entire bucket. 
 * 
 * @param  {String} folderPath 		Absolute folder path on the local machine
 * @return {Void} 
 */
const deleteFolder = folderPath => new Promise(onSuccess => rimraf(folderPath, () => onSuccess()))

/**
 * Deletes a file under a bucket.
 * 
 * @param  {String}  filePath 	Absolute file path on the local machine
 * @return {Void}
 */
const deleteFile = filePath => new Promise((onSuccess, onFailure) => fs.unlink(filePath, err => err ? onFailure(err) : onSuccess()))

/**
 * Creates file or update file located under 'filePath'. 
 * 
 * @param  {String} filePath 		Absolute file path on the local machine
 * @param  {Object} content 		File content
 * @return {Void}                	
 */
const writeToFile = (filePath, content) => new Promise((onSuccess, onFailure) => {
	content = content || ''
	const stringContent = (typeof(content) == 'string' || content instanceof Buffer) ? content : JSON.stringify(content, null, '  ')
	fs.writeFile(filePath, stringContent, err => err ? onFailure(err) : onSuccess())
})

/**
 * Creates folders under a rootFolder
 * 
 * @param  {String}  rootFolder 					Root folder. This folder must exist prior to calling this function.
 * @param  {Array}   folders    					Array of folders so that the path of the last item in that array will be: 
 *                                   				rootFolder/folders[0]/folders[1]/.../folders[n]
 * @param  {Object}  options
 * @param  {Boolean} options.deletePreviousContent  If set to true, this will delete the content of the existing folder
 * @return {String} 								Path of the latest folder:
 *                               					rootFolder/folders[0]/folders[1]/.../folders[n]           
 */
const createFolders = (rootFolder, folders=[], options={}) => co(function *() {
	const { deletePreviousContent } = options
	if (!rootFolder)
		throw new Error('\'rootFolder\' is required.')
	const rootExists = yield fileExists(rootFolder)
	if (!rootExists)
		throw new Error(`Root folder ${rootFolder} does not exist.`)

	yield folders.reduce((processPrevious, f) => co(function *(){
		const rootPath = yield processPrevious
		const folderPath = join(rootPath, f)
		const folderExists = yield fileExists(folderPath)
		if (folderExists && deletePreviousContent) 
			yield deleteFolder(folderPath)
		else if (!folderExists) 
			yield createFolder(folderPath)
		return folderPath
	}), Promise.resolve(rootFolder))
}).catch(e => { throw new Error(`${e.message}\n${e.stack}`) })

/**
 * Gets a file under a Google Cloud Storage's 'filePath'.
 * 
 * @param  {String}  filePath 	Absolute file path on the local machine
 * @return {Object}
 */
const readFile = filePath => new Promise((onSuccess, onFailure) => fs.readFile(filePath, (err, data) => err ? onFailure(err) : onSuccess(data)))

/**
 * Gets an array of files located under the 'folderPath'. 
 * 
 * @param  {String} 		  folderPath     		Absolute path to folder
 * @param  {String|[String]}  options.pattern 		Default is '*.*' which means all immediate files. 
 * @param  {String|[String]}  options.ignore 		
 * @return {[String]}         				
 */
const getFiles = (folderPath='', options={}) => co(function *(){
	const pattern = options.pattern || '*.*'
	const ignore = options.ignore
	const patterns = (typeof(pattern) == 'string' ? [pattern] : pattern).map(p => join(folderPath, p))
	const opts = ignore ? { ignore:(typeof(ignore) == 'string' ? [ignore] : ignore).map(p => join(folderPath, p)) } : {}

	return yield fg(patterns,opts)
})

/**
 * Gets the absolute path. If not input is passed, it returns the current working directory. Supports both Windows and Unix OSes. 
 * 
 * @param  {String} somePath Some absolute or relative file or folder path.
 * @return {String}          Absolute path
 */
const getAbsolutePath = somePath => {
	if (!somePath)
		return process.cwd()
	else if (somePath.match(/^\./)) 
		return resolve(somePath)
	else if (somePath.match(/^(\\|\/|~)/)) 
		return somePath
	else if (typeof(somePath) == 'string')
		return resolve(somePath)
	else
		throw new Error(`Invalid path ${somePath}`)
}

/**
 * Gets a JSON object loacted under 'filePath'. This method is an alternative to 'require(filePath)' which caches results and prevents
 * to get access to a refreshed version of the JSON file. 
 * 
 * @param  {String} filePath Absolute path to the JSON file. 
 * @return {Object}          JSON Object
 */
const getJSON = filePath => readFile(filePath).then(text => {
	if (!text || !text.length)
		return {}

	try {
		return JSON.parse(text.toString()) || {}
	} catch(e) {
		return (() => ({}))(e)
	}
})

const _isFolder = folderPath => new Promise(resolve => fs.stat(folderPath, (err,data) => resolve(err || !data || !data.isDirectory ? false : data.isDirectory())))
const _readdir = folderPath => new Promise(resolve => fs.readdir(folderPath, (err,data) => resolve(err || !data ? [] : data)))
const _rmdir = folderPath => new Promise(resolve => fs.rmdir(folderPath, resolve))

/**
 * Deletes all the empty folders(incl. 'rootFolder') under 'rootFolder'. 
 * 
 * @param {String} rootFolder 	Absolute path to folder. 
 * @yield {Void}   
 */
const deleteEmptyFolders = rootFolder => co(function *(){
	const isDir = yield _isFolder(rootFolder)
	if (!isDir) 
		return

	let files = yield _readdir(rootFolder)
	yield files.map(file => co(function *(){
		const fullPath = join(rootFolder, file)
		yield deleteEmptyFolders(fullPath)
	}))

	// re-evaluate files; after deleting subfolder
	// we may have parent folder empty now
	if (files.length > 0)
		files = yield _readdir(rootFolder)

	if (files.length == 0) 
		yield _rmdir(rootFolder)
})

module.exports = {
	type: 'local',
	'get': getFiles,
	getJSON,
	read: readFile,
	write: writeToFile,
	exists: fileExists,
	delete: deleteFile,
	getAbsolutePath,
	folder: {
		create: createFolder,
		createMany: createFolders,
		delete: deleteFolder,
		deleteEmpties: deleteEmptyFolders
	}
}