var Reporter = require('../reporter');
var _ = require('lodash');
var fs = require('fs');


/**
 * Passon html reporter write the preprocessed html coverage data into destination .html file.
 * from the test run
 *
 * @class  PassonHtml
 * @param {Object} options hash of options interpreted by reporter
 */
var PassHTMLReporter = Reporter.extend({
  name: 'passhtml',
  defaultOutput: 'coverage.html',
  wantsJSONOutput: false,
  transform: function(body) {
    var output = "<html><head>{{header}}</head><body>{{body}}</body></html>";
    var cssStyle = "<style>#blanket-main {margin:2px;background:#EEE;color:#333;clear:both;font-family:'Helvetica Neue Light', 'HelveticaNeue-Light', 'Helvetica Neue', Calibri, Helvetica, Arial, sans-serif; font-size:17px;} #blanket-main a {color:#333;text-decoration:none;}  #blanket-main a:hover {text-decoration:underline;} .blanket {margin:0;padding:5px;clear:both;border-bottom: 1px solid #FFFFFF;} .bl-error {color:red;}.bl-success {color:#5E7D00;} .bl-file{width:auto;} .bl-cl{float:left;} .blanket div.rs {margin-left:50px; width:150px; float:right} .bl-nb {padding-right:10px;} #blanket-main a.bl-logo {color: #EB1764;cursor: pointer;font-weight: bold;text-decoration: none} .bl-source{ overflow-x:scroll; background-color: #FFFFFF; border: 1px solid #CBCBCB; color: #363636; margin: 25px 20px; width: 80%;} .bl-source div{white-space: pre;font-family: monospace;} .bl-source > div > span:first-child{background-color: #EAEAEA;color: #949494;display: inline-block;padding: 0 10px;text-align: center;width: 30px;} .bl-source .hit{background-color:#c3e6c7} .bl-source .miss{background-color:#e6c3c7} .bl-source span.branchWarning{color:#000;background-color:yellow;} .bl-source span.branchOkay{color:#000;background-color:transparent;}</style>";

    function blanket_toggleSource(id) {
      var element = document.getElementById(id);
      if(element.style.display === 'block') {
        element.style.display = 'none';
      } else {
        element.style.display = 'block';
      }
    }


    var script = "<script type='text/javascript'>" +
      blanket_toggleSource.toString().replace('function ' + blanket_toggleSource.name, 'function blanket_toggleSource') +
      "</script>";

    output = output.replace('{{header}}', [cssStyle, script].join("\n"))
      .replace('{{body}}', body.content);

    return output;
  }
});

PassHTMLReporter.prototype.report = function(coverageData) {
  var output = this.transform(coverageData);
  fs.writeFileSync(this.outputFile, output);

  var options = this.options;

  var keys = options.cliOptions.passhtmlOptions.teamcityReportingKeys || {};
  var absCoverageBKey = keys.absCoverageBKey || 'CodeCoverageB';
  var absLCoveredKey = keys.absLCoveredKey || 'CodeCoverageAbsLCovered';
  var absLTotalKey = keys.absLTotalKey || 'CodeCoverageAbsLTotal';
  var absCoverageLKey = keys.absCoverageLKey || 'CodeCoverageL';

  console.log("##teamcity[message text='Code Coverage is " + coverageData.coverage + "%']");
  console.log("##teamcity[blockOpened name='Code Coverage Summary']");
  console.log("##teamcity[buildStatisticValue key='" + absCoverageBKey + "' value='" + coverageData.coverage + "']");
  console.log("##teamcity[buildStatisticValue key='" + absLCoveredKey + "' value='" + coverageData.coveredStm + "']");
  console.log("##teamcity[buildStatisticValue key='" + absLTotalKey + "' value='" + coverageData.totalStm + "']");
  console.log("##teamcity[buildStatisticValue key='" + absCoverageLKey + "' value='" + coverageData.coverage + "']");
  console.log("##teamcity[blockClosed name='Code Coverage Summary']");
};

module.exports = PassHTMLReporter;
