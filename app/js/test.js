/**
 * @namespace ag-toggle
 * @author james whitmarsh
 * @fileOverview
 * app-generator repo - https://github.com/dresources/5250-app-generator
 * app-generator wiki - https://github.com/dresources/5250-app-generator/wiki
 * app-generator jira - https://drgjira.dresources.com/secure/RapidBoard.jspa?rapidView=127&view=detail
 */

// 3rd party requires
var async = require('async');
var fsx = require('fs-extra');
var _ = require('lodash');
var pkg = require('./package.json');
var util = require('util');

// ag requires
var Dto = require('ag-dto'); // gets an empty copy of the DTO object
var Result = require('ag-errorHandler').Result;

// globals
var result = null,
    rowHeadings = [];

/**
 * this is the entry point for app-generator
 * keep this function as empty as possible
 * @param {object} dtoObj the data transfer object
 * @param {function} callback
 * @returns {object} result object (@see errorHandler.Result)
 */
function main(dtoObj, callback) {
    //all exported functions have to return a result object
    result = new Result();

    //check to see we've been passed a DTO object. If we have, assign it to our global
    if (!dtoObj || dtoObj === undefined) {
        return callback(result.error('error message goes here'));
    }

    if (!callback || callback === undefined) {
        console.error('<%= appname %>.main() : no callback provided');
        return false;
    }

    Dto = dtoObj;

    // this is an example of throwing a warning
    if (!Dto.resources.xmlObj || Dto.resources.xmlObj === undefined) {
        result = result.warning('there is no xmlObject!')
    }

    _doWork(function (err) {
        if (err) {
            result = result.error(err);
        } else if (!result.messages.length) { // check for warnings
            result = result.success();
        }
        return callback(result);
    });
}

function _doWork(callback) {
    var _config = Dto.resources._config;

    // loop the rows
    async.eachSeries(_config.worksheet.sheetData.row, _processRow, function (err, res) {
        callback(0);
    });
}

function _processRow(row, callback) {

    async.eachSeries(row.c, _processCell, function (err, res) {
        //console.log(row.c);

        if (row.r === 1) {
            rowHeadings = row.c.map(function (x) {
                return x.cellValue;
            });
        } else {
            var complexElement = _buildComplexElement(row);
            Dto.app.instances[0].complexElements.push(complexElement);
        }

        callback(0);
    });
}

function _buildComplexElement(row) {
    var complexElement = {};

    for (var i = 0; i < rowHeadings.length; i++) {
        var heading = rowHeadings[i];

        if (heading === 'input') {
            complexElement.cellRef = row.c[i].f;
        } else {
            complexElement[heading] = row.c[i].cellValue;
        }

        complexElement.id = util.format('XLEW_%s_%s_%s', 1, row.r, 1);
    }

    return complexElement;
}

function _processCell(cell, callback) {
    cell.cellValue = _getCellValue(cell);
    // console.log(cellVal);
    callback(0);
}

function _getCellValue(cell) {
    // check cell type
    var cellValue = null;

    switch (cell.t) {
        case 's':
            //string
            cellValue = Dto.resources.sharedStrings.sst.si[cell.v].t;
            break;
        case 'b':
            //boolean
            cellValue = cell.v;
            break;
        default:
            break;
    }

    return cellValue;
}

module.exports = {
    main: main
};
/**
 * Created by jwhitmarsh on 27/01/2015.
 */
