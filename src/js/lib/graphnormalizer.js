'use strict';
var Logger = require('./logger');
module.exports = function() {
    var commonNormalizerUtil = {
        getTimestampHash: function(tsdbData) {
            var hashTimestamp = {};
            _.forEach(tsdbData, function(tsdbDatum) {
                _.forEach(tsdbDatum.dps, function(dpsVal, timestamp) {
                    hashTimestamp[timestamp] = true;
                });
            });
            return Object.keys(hashTimestamp);
        },
        getFormattedTimestamp: function(timestamps, option) {
            var formattedTimestamps = [];
            _.forEach(timestamps, function(ts) {
                formattedTimestamps.push(
                  ts //to be formatted stuffs here
                );
            });
            return formattedTimestamps;
        }
    };
    return {
        _util: commonNormalizerUtil,
        // dygraph: {},
        // chartjs: {},
        // highchart: {},
        chartist: {
            normalize: function(tsdbData) {
                var convertedData = {
                  labels : [],
                  series : []
                };
                var uniqueTimestamps = commonNormalizerUtil.getTimestampHash(tsdbData);

                //log for testing
                Logger.log(uniqueTimestamps);

                //put in formatted timestamps
                convertedData.labels = commonNormalizerUtil.getFormattedTimestamp(uniqueTimestamps);
                convertedData.series = [];


                //fill in the series skeleton
                _.forEach(uniqueTimestamps, function(ts, tsIdx){
                  _.forEach(tsdbData, function(tsdbDatum, idx){
                    convertedData.series[idx] = convertedData.series[idx] || [];
                    convertedData.series[idx][tsIdx] = tsdbDatum.dps[ts] || null;
                  });
                });

                //fill in the number
                Logger.log(convertedData);                

                return convertedData;
            }
        }
    };
}();