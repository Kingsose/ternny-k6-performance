/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 40.625, "KoPercent": 59.375};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.40625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3333333333333333, 500, 1500, "/plan"], "isController": false}, {"data": [0.14285714285714285, 500, 1500, "/auth"], "isController": false}, {"data": [0.5714285714285714, 500, 1500, "/add-trip"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "/travel-persona"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "/profile"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 32, 19, 59.375, 855.9687500000001, 367, 2398, 725.5, 1711.8, 2203.649999999999, 2398.0, 1.0987878995982556, 5.94169690837139, 0.1280264953816571], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["/plan", 6, 4, 66.66666666666667, 759.0, 379, 1734, 647.5, 1734.0, 1734.0, 1734.0, 0.27679106887484434, 1.5001409183697005, 0.031355238270978456], "isController": false}, {"data": ["/auth", 7, 6, 85.71428571428571, 1237.0, 434, 2398, 1166.0, 2398.0, 2398.0, 2398.0, 0.2557918585105606, 1.3840523482606153, 0.02897642147189944], "isController": false}, {"data": ["/add-trip", 7, 3, 42.857142857142854, 707.4285714285714, 381, 1660, 496.0, 1660.0, 1660.0, 1660.0, 0.26250656266406663, 1.4141588891284782, 0.030762487812195306], "isController": false}, {"data": ["/travel-persona", 6, 4, 66.66666666666667, 892.3333333333334, 367, 2099, 759.0, 2099.0, 2099.0, 2099.0, 0.2815447421519403, 1.5249881956501337, 0.03464320069447703], "isController": false}, {"data": ["/profile", 6, 2, 33.333333333333336, 645.3333333333334, 371, 1147, 450.0, 1147.0, 1147.0, 1147.0, 0.2944496245767287, 1.591820358124356, 0.03421826691858468], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,020 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,166 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,147 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 755 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,398 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,099 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 984 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 727 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,734 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,660 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 733 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 991 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 843 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 791 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}, {"data": ["The operation lasted too long: It took 1,452 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.2631578947368425, 3.125], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 32, 19, "The operation lasted too long: It took 1,020 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,166 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,147 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["/plan", 6, 4, "The operation lasted too long: It took 724 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,734 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 571 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 733 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", ""], "isController": false}, {"data": ["/auth", 7, 6, "The operation lasted too long: It took 984 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,166 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 2,398 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,523 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": ["/add-trip", 7, 3, "The operation lasted too long: It took 1,660 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 843 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 755 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["/travel-persona", 6, 4, "The operation lasted too long: It took 727 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 991 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 2,099 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 791 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", ""], "isController": false}, {"data": ["/profile", 6, 2, "The operation lasted too long: It took 1,020 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,147 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
