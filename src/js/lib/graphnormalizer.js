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
                formattedTimestamps.push(ts //to be formatted stuffs here
                );
            });
            return formattedTimestamps;
        },
        /**
         * generate color range
         */
        generateColor: function() {
            var ret = '#' + ((1 << 24) * Math.random() | 0).toString(16);
            while (ret.length < 7) {
                ret += '0';
            }
            return ret;
        }
    };
    return {
        _util: commonNormalizerUtil,
        chartjs: {
            draw: function(tsdbData, chartContainer) {
                var graphNormalizedData = this.normalize(tsdbData);
                return graphNormalizedData;
            },
            normalize: function(tsdbData) {
                var convertedData = {
                    labels: [],
                    datasets: []
                };
                var uniqueTimestamps = commonNormalizerUtil.getTimestampHash(tsdbData);
                //log for testing
                Logger.log(uniqueTimestamps);
                //put in formatted timestamps
                convertedData.labels = commonNormalizerUtil.getFormattedTimestamp(uniqueTimestamps);
                convertedData.datasets = [];
                //setup the lines (series)
                _.forEach(tsdbData, function(tsdbDatum, idx) {
                    convertedData.datasets[idx] = {
                        label: 'line ' + new Date(),
                        // fillColor: "#fff",
                        strokeColor: commonNormalizerUtil.generateColor(),
                        pointColor: "#000",
                        // pointStrokeColor: "#fff",
                        // pointHighlightFill: "#fff",
                        // pointHighlightStroke: "rgba(220,220,220,1)",
                        data: []
                    };
                });
                //fill in the series skeleton
                _.forEach(uniqueTimestamps, function(ts, tsIdx) {
                    _.forEach(tsdbData, function(tsdbDatum, idx) {
                        convertedData.datasets[idx].data[tsIdx] = tsdbDatum.dps[ts] || null;
                    });
                });
                //fill in the number
                Logger.log(convertedData);
                return convertedData;
            }
        },
        /**
         * use high charts
         * npm install chartist angular-chartist
         * <chartist class="ct-chart" chartist-chart-type="Line" chartist-data="chartData" chartist-chart-options="chartOption"></chartist>
         *
         * @type {Object}
         */
        chartist: {
            draw: function(tsdbData, chartContainer) {
                //generate the graph
                var graphNormalizedData = this.normalize(tsdbData);
                return graphNormalizedData;
            },
            normalize: function(tsdbData) {
                var convertedData = {
                    labels: [],
                    series: []
                };
                var uniqueTimestamps = commonNormalizerUtil.getTimestampHash(tsdbData);
                //log for testing
                Logger.log(uniqueTimestamps);
                //put in formatted timestamps
                convertedData.labels = commonNormalizerUtil.getFormattedTimestamp(uniqueTimestamps);
                convertedData.series = [];
                //fill in the series skeleton
                _.forEach(uniqueTimestamps, function(ts, tsIdx) {
                    _.forEach(tsdbData, function(tsdbDatum, idx) {
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