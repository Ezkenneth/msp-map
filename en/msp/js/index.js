if (!String.prototype.includes) {
    console.log("trying to include");
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

var parseTime = d3.timeParse("%b-%Y");

function drawBar(target, xScale, values) {
    var svg = target.append('svg').attr('height', 40).attr("width", $("#information").width());
    var formatter = d3.format(",");

    console.log(values);

    svg.append('g')
        .attr('class', 'bar');

    svg.select('.bar')
        .append('text')
        .attr('text-anchor', 'right')
        .attr('dy', '1.2em')
        .text(0);

    svg.select('.bar')
        .append('rect')
        .attr('height', 40)
        .style("fill", "#2ca25f")
        .attr('width', 0)
        .transition()
        .duration(1000)
        .attr('width', xScale(values[0]));

    svg.select('.bar')
        .append('rect')
        .attr('x', xScale(values[0]) + 2)
        .attr('height', 40)
        .style("fill", "#99d8c9")
        .attr('width', 0)
        .transition()
        .duration(1000)
        .delay(700)
        .attr('width', xScale(values[1]));

    svg.select('.bar')
        .append('rect')
        .attr('x', xScale(values[0]) + xScale(values[1]) + 4)
        .attr('height', 40)
        .style("fill", "#e5f5f9")
        .attr('width', 0)
        .transition()
        .duration(1000)
        .delay(1400)
        .attr('width', xScale(values[2]));

    svg.select('.bar')
        .select('text')
        .transition()
        .duration(1000)
        .tween("text", function (d) {
            var el = d3.select(this);
            var interpolator = d3.interpolate(el.text().replace(/[,$]/g, ""), values[0] + values[1] + values[2]);
            return function (t) {
                el.text("$" + formatter(interpolator(t).toFixed(0)));
            };
        })
        .attr("x", function (d) {
            return xScale(values[0]) + xScale(values[1]) + xScale(values[2]) + 10;
        });
}

function template(data, colors, xScale) {
    var list = d3.select('#project-list').html("");

    for (var d = 0; d < data.length; d++) {
        var item = list
            .datum(data[d])
            .append('li')
            .attr("id", "projectResult" + d)
            .attr("class", "project")
            .style("border-left", "5px solid " + colors[d])
            .style("padding-left", "10px");

        var header = item.append('div').attr('class', 'project-header');

        // adding the project title to the list item
        var titleAndIcons = header
            .append('div')
            .attr('class', 'row');

        var projectName = titleAndIcons.append('h3')
            .attr('class', 'col-md-8')
            .html(function (k) {
                return k["Project"].split(";")[1] || "Unknown Project Name";
            });


        var startDate = parseTime(data[d]["Project Start Date"]);
        //var startDate = new Date(data[d]["Project Start Date"]);


        //console.log(data[d]["Project Start Date"]);
        console.log("start date", startDate);
        console.log(startDate.getFullYear());
        if (startDate.getFullYear() == new Date().getFullYear()) {
            projectName.append("span")
                .attr("class", "newTag")
                .html("new");
        }


        if (data[d]["Non MSP Projects"].toLowerCase() == "yes") {
            projectName.append("span")
                .attr("class", "nonMspTag")
                .html("other projects");
        }
        var icons = titleAndIcons.append('div')
            .attr('class', 'icons');

        icons
            .append('a')
            .attr('class', 'open-map')
            .attr('href', '#funding-map')
            .append('i')
            .attr('class', 'fas fa-map-marker-alt');

        icons.append('a')
            .attr('href', function (d) {
                return d['Website'];
            })
            .attr('target', '_blank')
            .append('i')
            .attr('class', 'fas fa-external-link-alt');

        var orgAndDate = header.append('div')
            .attr('class', 'row');

        orgAndDate.append('p')
            .attr('class', 'col-md-6')
            .html(function (k) {
                return k["Project"].split(";")[0];
            });

        orgAndDate.append('p')
            .attr('class', 'col-md-6')
            .html(
                function (d) {
                    var monthNames = [
                        "January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"
                    ];
                    var startDate = parseTime(d["Project Start Date"]);
                    var endDate = parseTime(d["Project End Date"])
                    //var startDate = new Date(d['Project Start Date']);
                    //var endDate = new Date(d['Project End Date']);

                    return monthNames[startDate.getMonth()] + " " + startDate.getFullYear() + " to " + monthNames[endDate.getMonth()] + " " + endDate.getFullYear();
                }
            ).style('text-align', 'right')
            .style('color', 'black')
            .style('text-decoration', 'underline');

        var amount = item.append('div')
            .attr('class', 'amount');

        drawBar(amount, xScale, [+data[d]["Funding Amount"].replace(/[,$]/g, ""), +data[d]["Leveraged Funds"].replace(/[,$]/g, ""), +data[d]["Other Funding Sources"].replace(/[,$]/g, "")]);

        // adding the project purpose
        item.append('p')
            .html(function (k) {
                return k['Purpose of Project'];
            });

        // Bubbles div
        var b = ('bubbles' + d) // Uses this value to append the tags to the right place.

        item.append('p')
            .attr("class", "small")
            .style("display", "inline")
            .style("font-weight", "bold")
            .text('Tags: ');

        item.append('ul')
            .attr('id', b)
            .style("display", "inline")
            .attr('class', 'tags small list-unstyled list-inline');

        // Add gender bubble
        var genderText;
        if (data[d].Gender == "All") {
            genderText = "All Genders"
        } else {
            genderText = data[d].Gender
        }
        var genderBubble = '<li class="list-inline-item">' + genderText + '</li>';
        var $input = $(genderBubble);
        $input.appendTo($("#" + b));

        // Add age bubble		
        data[d].ageGroups.forEach(function (d) {
            d = (d.charAt(0).toUpperCase() + d.slice(1)); // Has a doodad that makes the first letter upper case
            if (d == "OlderAdults") {
                d = "Older Adults" // adds space if needs be
            }
            var ageBubble = '<li class="list-inline-item">' + d + '</li>';
            var $input = $(ageBubble);
            $input.appendTo($("#" + b));
        });

        // Add intervention type bubble
        var genderBubble = '<li class="list-inline-item">' + data[d]['Intervention Type'] + '</li>'; // WHY ARE THERE SPACES IN THE OBJECT NAMES!
        var $input = $(genderBubble);
        $input.appendTo($("#" + b));

        // Add Common risk factors bubble
        data[d]['Common Risk Factor'].split(";").forEach(function (d) {
            var btnText = d.trim();
            var ageBubble = '<li class="list-inline-item">' + btnText + '</li>';
            var $input = $(ageBubble);
            $input.appendTo($("#" + b));
        });

        //console.log(data[d])		


        // partners div
        var partners = data[d]["Partners"].split(/[,;]/);

        if (!(partners.length == 1 && partners[0] == "")) {
            var details = item.append("details")
                .attr("class", "acc-group off wb-lbx");

            details.append("summary")
                .html('Match Funding Partners')
                .attr("class", "tgl-tab wb-init wb-toggle-inited");

            details.selectAll(".partner")
                .data(partners)
                .enter()
                .append('div')
                .attr('class', 'partner')
                .html(function (d) {
                    return d;
                });
        }

        item.on("mouseover", function (d) {
            var affectedAreas = d["Delivery Location"].replace(/[" "]/g, "").split(",");
            if (affectedAreas[0].toLowerCase() != "all") {
                for (var i = 0; i < affectedAreas.length; i++) {
                    d3.select("#" + affectedAreas[i]).style("opacity", 0.5);
                }
            } else {
                d3.selectAll(".province").style("opacity", 0.5);
            }
        });

        item.on("mouseout", function (d) {
            d3.selectAll(".province").style("opacity", 0);
        });
    }
}

function addCoordinates(pointsToProcess, callback) {
    var pointsProcessed = [];

    function process(point, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(request.responseText);
                if (data[0] == undefined) {
                    console.log(point);
                }
                var coordinates = data[0].geometry.coordinates;
                point.coordinates = new L.LatLng(coordinates[1], coordinates[0]);
                callback(point);
            }
        };
        request.open("GET", "https://www.geogratis.gc.ca/services/geolocation/en/locate?q=" + point["Address"], true);
        request.send();
    }

    pointsToProcess.forEach(function (el) {
        process(el, function (newPoint) {
            pointsProcessed.push(newPoint);

            if (pointsProcessed.length == pointsToProcess.length) {
                callback(pointsProcessed);
            }
        });
    });
}

function renderData(data, colors, xScale, map) {
    console.log("rendering", data, colors, xScale, map);
    $("#information").pagination({
        dataSource: data,
        pageSize: 4,
        pageRange: 9999,
        prevText: "Previous",
        nextText: "Next",
        className: "paginationHeight",
        ulClassName: "pagination",
        callback: function (data, pagination) {
            template(data, colors, xScale);
        },
        afterPaging: function () {
            d3.select('.paginationjs-next').select('a').attr('rel', 'next');
            d3.select('.paginationjs-prev').select('a').attr('rel', 'prev');
        }
    });
    d3.select('.paginationjs-next').select('a').attr('rel', 'next');
    d3.select('.paginationjs-prev').select('a').attr('rel', 'prv');
    $("#results-count").text(data.length);
    if (data.length == 1) {
        console.log(data);
        $("#results-plural").hide();
    } else {
        console.log(data);
        $("#results-plural").show();
    }
    $("#results-filtered").hide();
}

function age(lowerBound, upperBound) {
    lowerBound = lowerBound == "All" ? 0 : +lowerBound;
    upperBound = upperBound == "All" ? 300 : +upperBound;

    let ageGroups = {
        "infants": {
            "lower": 0,
            "higher": 4
        },
        "children": {
            "lower": 5,
            "higher": 11
        },
        "youth": {
            "lower": 11,
            "higher": 17
        },
        "adult": {
            "lower": 18,
            "higher": 64
        },
        "olderAdults": {
            "lower": 65,
            "higher": 300
        }
    };

    var results = [];
    var keys = Object.keys(ageGroups);

    for (var i = 0; i < keys.length; i++) {
        var ageGroup = keys[i];
        var group = ageGroups[ageGroup];

        if (lowerBound >= group["lower"] && lowerBound <= group["higher"])
            results.push(ageGroup);
        else if (upperBound <= group["higher"] && upperBound >= group["lower"])
            results.push(ageGroup);
        else if (lowerBound <= group["lower"] && upperBound >= group["higher"])
            results.push(ageGroup);
    }
    return results;
}

// filtering functions
function filterByMultipleCommonRiskFactors(data, interventions) {
    if (interventions.length == 0) {
        return data;
    }

    let filteredData = data.filter(function (el) {
        let x = false
        for (let i = 0; i < interventions.length; i++) {
            el["Common Risk Factor"].split(";").forEach(function (data) {
                if (data.toLowerCase().trim() == interventions[i]) {
                    x = true;
                }
            })
        }

        return x;
    });

    console.log("data");
    console.log(data);
    console.log(filteredData);

    return filteredData;
}

function filterByMultipleInterventions(data, interventions) {
    if (interventions.length == 0) {
        return data;
    }

    let filteredData = data.filter(function (el) {
        for (let i = 0; i < interventions.length; i++) {
            if (el["Intervention Type"].toLowerCase() == interventions[i])
                return true;
        }


        return false;
    });

    console.log(data);
    console.log(filteredData);

    return filteredData;
}

function filterByMultipleAges(data, ages) {
    if (ages.length == 0) {
        return data;
    }

    let filteredData = data.filter(function (el) {
        for (let i = 0; i < ages.length; i++) {
            if (el["ageGroups"].includes(ages[i]))
                return true;
        }
        return false;
    });
    console.log(data);
    console.log(filteredData);

    return filteredData;
}

function filterByMultipleGenders(data, genders) {
    if (genders.length == 0) {
        return data;
    }

    let filteredData = data.filter(function (el) {
        for (let i = 0; i < genders.length; i++) {
            if (el["Gender"].toLowerCase() == genders[i] || el["Gender"].toLowerCase() == "all")
                return true;
        }
        return false;
    });

    console.log(data);
    console.log(filteredData);

    return filteredData;
}

function filterByIntervention(data, type) {
    let filteredData = data.filter(function (el) {
        if (type == "all")
            return true;
        return el["Intervention Type"].toLowerCase() == type;
    });
    return filteredData;
}

d3.csv("./data/partnerships_live.csv", function (csv) {
    var provinceLookup = {
        "Quebec": "QC",
        "Newfoundland and Labrador": "NL",
        "British Colombia": "BC",
        "Nunavut": "NU",
        "Northwest Territories": "NT",
        "New Brunswick": "NB",
        "Nova Scotia": "NS",
        "Saskatchewan": "SK",
        "Alberta": "AB",
        "Prince Edward Island": "PE",
        "Yukon Territory": "YT",
        "Manitoba": "MB",
        "Ontario": "ON"
    };

    var colors = [
        "#4285F4", // blue
        "#EA4335", // red
        "#FBBC05", // yellow
        "#34A853", // green
    ];

    // places all different intervention types in an array
    var interventionTypes = [];

    csv.forEach(function (el) {
        if (!interventionTypes.includes(el["Intervention Type"])) {
            interventionTypes.push(el["Intervention Type"]);
        }
    });

    // makes a dropdown option of each intervention type
    interventionTypes.forEach(function (type) {
        d3.select('#interventionType')
            .append('button')
            .attr('class', 'bubble')
            .attr('id', type.toLowerCase())
            .html(type);
    });

    var commonRiskFactors = [];

    csv.forEach(function (el) {
        var riskFactors = el["Common Risk Factor"].split(";");

        for (let i = 0; i < riskFactors.length; i++) {
            if (!commonRiskFactors.includes(riskFactors[i].trim())) {
                commonRiskFactors.push(riskFactors[i].trim());
            }
        }
    });

    // makes a dropdown option of each common risk factor
    commonRiskFactors.forEach(function (type) {
        d3.select('#commonRiskFactors')
            .append('button')
            .attr('class', 'bubble')
            .attr('id', type.toLowerCase())
            .html(type);
    });

    console.log(commonRiskFactors);

    // adding an "ageGroups" category to the dataset to make it more verbose
    csv.forEach(function (el) {
        el["ageGroups"] = age(el["Lower Age"], el["Upper Age"]);
    });

    // rendering the map
    var map = L.map('funding-map', {
        center: [54.9641601681754, -90.4160163302575],
        zoom: 4,
        minZoom: 3,
        zoomControl: false
    });

    // filtering ages
    var listOfSelectedAges = [];
    // filtering genders
    var listOfSelectedGenders = [];
    // filtering intervention types
    var listOfSelectedInterventions = [];
    // filtering common risk factors
    var listOfSelectedCommonRiskFactors = [];

    // setting the dropdown settings
    // these will dynamically change based on the filter the use picks
    var selectedGender = "all";
    var selectedIntervention = "all";

    var vectorTileLayerStyles = {
        // A plain set of L.Path options.
        landuse: {
            weight: 0,
            fillColor: '#9bc2c4',
            fillOpacity: 1,
            fill: true
        },
        // A function for styling features dynamically, depending on their
        // properties and the map's zoom level
        admin: function (properties, zoom) {
            var level = properties.admin_level;
            var weight = 1;
            if (level == 2) { weight = 4; }
            return {
                weight: weight,
                color: '#cf52d3',
                dashArray: '2, 6',
                fillOpacity: 0
            }
        },
        // A function for styling features dynamically, depending on their
        // properties, the map's zoom level, and the layer's geometry
        // dimension (point, line, polygon)
        water: function (properties, zoom, geometryDimension) {
            if (geometryDimension === 1) {   // point
                return ({
                    radius: 5,
                    color: '#cf52d3',
                });
            }

            if (geometryDimension === 2) {   // line
                return ({
                    weight: 1,
                    color: '#cf52d3',
                    dashArray: '2, 6',
                    fillOpacity: 0
                });
            }

            if (geometryDimension === 3) {   // polygon
                return ({
                    weight: 1,
                    fillColor: '#9bc2c4',
                    fillOpacity: 1,
                    fill: true
                });
            }
        },
        // An 'icon' option means that a L.Icon will be used
        place: {
            icon: new L.Icon.Default()
        },
        road: []
    };
    // my server is using Slava's domain because my own IP is blacklisted for phishing :(
    // L.vectorGrid.protobuf('https://health-infobase.canada.ca/src/map-tiles/data/v3/{z}/{x}/{y}.pbf', {
    //         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //         vectorTileLayerStyles: vectorTileLayerStyles
    // }).addTo(map); 
    // L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    // }).addTo(map); 
    // 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=
    // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: 1,
    //     id: 'mapbox.streets',
    //     accessToken: 'pk.eyJ1IjoiYWRhbWpzaW0iLCJhIjoiY2thdmF0Ym9kMGNhbTJ6a3l5dzl3ZmdrcCJ9.YcSMrFRPTc7hCZgYkJeoSQ'
    // }).addTo(map);

    // LEAFLET DOCS
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYWRhbWpzaW0iLCJhIjoiY2thdmF0Ym9kMGNhbTJ6a3l5dzl3ZmdrcCJ9.YcSMrFRPTc7hCZgYkJeoSQ'
    }).addTo(map);

    //add zoom control with your options
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // create the SVG layer on top of the map
    L.svg().addTo(map);

    // add a group in the SVG for the provinces
    d3.select(".leaflet-overlay-pane svg")
        .append("g")
        .attr("id", "provinceGroup");

    // map stuff
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    // projecting the map
    var transform = d3.geoTransform({
        point: projectPoint
    });
    var path = d3.geoPath().projection(transform);

    // reading in the map json
    d3.json("../en/msp/data/canada.v2.json", function (geoJson) {
        // creating the provinces on the svg layer
        // opacity will be 0.5 when a user hovers over a project
        var provincePaths = d3.select("#provinceGroup")
            .selectAll(".province")
            .data(geoJson.features)
            .enter()
            .append("g")
            .attr("class", "province")
            .attr("id", function (d) {
                return provinceLookup[d.properties["name"]];
            })
            .style("fill", "#c51b8a")
            .style("opacity", 0)
            .append("path")
            .attr("d", path);

        //update path after user done dragging or zooming
        map.on("moveend", function () {
            provincePaths.attr("d", path);
        });
    });

    // calculating the max value in order to properly scale the bar chart
    // (the /g modifer replaces all occurances)
    var max = d3.max(csv, function (d) {
        var amount = +d["Funding Amount"].replace("$", "").replace(/,/g, "") + +d["Leveraged Funds"].replace("$", "").replace(/,/g, "");
        return amount;
    });

    var xScale = d3.scaleLinear().domain([0, max]).range([0, $("#information").width() - 200]);

    // setting the sortBy default value
    var sortBy = "alphabet";

    // this just groups the circles together
    function drawGroups(target, data) {

        console.log("drawGroups", target, data);

        d3.selectAll(".intersection").remove();

        var intersection = d3.select(target)
            .selectAll(".intersection")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "intersection")
            .attr("transform", function (d) {
                return "translate(" + d.coordinates.x + "," + d.coordinates.y + ")";
            });

        intersection.append('circle')
            .attr("pointer-events", "visible")
            .attr("tabindex", 0)
            .style("fill", "#e74c3c")
            .attr("r", 10)
            .style("stroke-width", 0.5)
            .style("stroke", "black");

        intersection.append('text')
            .attr("text-anchor", "middle")
            .attr("y", 3)
            .style("fill", "#fff")
            .text(function (d) {
                return d.data.length;
            });
    }

    var headquarters = d3.select("#funding-map")
        .select(".leaflet-overlay-pane svg")
        .append("g")
        .attr("id", "headquarters");

    /* 	var legend = d3.select("#funding-map")
                    .append("div")
                    .attr("id","legend")
                    .attr("class","pull-right")
                    .style("position","relative")
                    .style("width","200px")
                    .style("height","100px")
                    .style("top","20px")
                    .style("z-index",1000)
                    .style("background-color","rgba(255, 255, 255, 1)")
                    .append("svg");
    
            	
                    legend.append("g").append("circle")
                    .attr("cx",20)
                    .attr("cy",20)
                    .attr("r",10)
                    .attr("style","stroke-width: 0.5; stroke: black; display: inline; fill: rgb(231, 76, 60); outline: none;") */

    // summary stats
    var formatter = d3.format(",");

    $("#projectCount").text(0);
    $("#phacFunding").text(0);
    $("#nonTaxPayer").text(0);
    $("#otherFunding").text(0);

    // count up for number of projects
    d3.select("#projectCount")
        .transition()
        .duration(1500)
        .tween("text", function (d) {
            const that = d3.select(this);
            let currentVal = +that.text().replace(/,/g, "");
            const newVal = +csv.length;
            const format = d3.format(",d");
            const i = d3.interpolateNumber(currentVal, newVal);
            return function (t) { that.text(format(i(t))); };
        });

    d3.select("#phacFunding")
        .transition()
        .duration(1500)
        .tween("text", function (d) {
            const that = d3.select(this);
            let currentVal = +that.text().replace(/,/g, "");
            const newVal = d3.sum(csv, function (d) { return +d["Funding Amount"].replace(/[,$]/g, "") });
            const format = d3.format(",d");
            const i = d3.interpolateNumber(currentVal, newVal);
            return function (t) { that.text("$" + format(i(t))); };
        });

    d3.select("#nonTaxPayer")
        .transition()
        .duration(1500)
        .tween("text", function (d) {
            const that = d3.select(this);
            let currentVal = +that.text().replace(/,/g, "");
            const newVal = d3.sum(csv, function (d) { return +d["Leveraged Funds"].replace(/[,$]/g, "") });
            const format = d3.format(",d");
            const i = d3.interpolateNumber(currentVal, newVal);
            return function (t) { that.text("$" + format(i(t))); };
        });

    d3.select("#otherFunding")
        .transition()
        .duration(1500)
        .tween("text", function (d) {
            const that = d3.select(this);
            let currentVal = +that.text().replace(/,/g, "");
            const newVal = d3.sum(csv, function (d) { return +d["Other Funding Sources"].replace(/[,$]/g, "") });
            const format = d3.format(",d");
            const i = d3.interpolateNumber(currentVal, newVal);
            return function (t) { that.text("$" + format(i(t))); };
        });

    /*     var interval = setInterval(function() {
            $("#projectCount").text(+($("#projectCount").text()) + 1);
    
            if ($("#projectCount").text() == csv.length)
                clearInterval(interval);
        }, 15); */

    /*     var sum = d3.sum(csv, function(d) {
            return +d["Funding Amount"].replace(/[,$]/g, "");
        });
        $("#phacFunding").text("$" + formatter(sum));
        
        sum = d3.sum(csv, function(d) {
            return +d["Leveraged Funds"].replace(/[,$]/g, "");
        });    
        $("#nonTaxPayer").text("$" + formatter(sum)); */

    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // preprocess the data by adding the coordinates
    addCoordinates(csv, function (data) {
        function positionCircles(d) {
            var point = map.latLngToLayerPoint(d["coordinates"]);
            return "translate(" + point.x + "," + point.y + ")";
        }

        function drawCircles(cleanData) {
            return headquarters.selectAll("circle")
                .data(cleanData)
                .enter()
                .append("circle")
                .attr("id", function (d, i) {
                    return "H" + i;
                })
                .attr("class", "headquarter")
                .attr("r", 10)
                .attr("cx", 0)
                .attr("cy", 0)
                .style("stroke-width", 0.5)
                .style("stroke", "black")
                .style("display", "inline")
                .attr("transform", positionCircles)
                .attr("pointer-events", "visible")
                .attr("tabindex", 0)
                .style("fill", "#e74c3c")
                .on("mouseover", function (d) {
                    var affectedAreas = d["Delivery Location"].replace(/[" "]/g, "").split(",");
                    if (affectedAreas[0].toLowerCase() != "all") {
                        affectedAreas.forEach(function (el) {
                            d3.select("#" + el).style("opacity", 0.5);
                        });
                    } else {
                        d3.selectAll(".province").style("opacity", 0.5);
                    }
                    div.style("opacity", 1);

                    div.html(d["Project"].split(";")[1])
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                }).on("mouseout", function (d) {
                    d3.selectAll(".province").style("opacity", 0);
                    div.style("opacity", 0).style("top", 0).style("left", 0);
                });
        }

        var circles = drawCircles(data);
        var pageData = data;
        console.log(pageData);

        // sorting stuff
        pageData = pageData.sort(function (a, b) {
            return d3.ascending(a["Project"].split(";")[1], b["Project"].split(";")[1]);
        });

        renderData(pageData, colors, xScale);

        // groups circles together
        drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

        // repositioning the circles on zoom
        map.on("zoom", function () {
            d3.selectAll(".intersection").remove();

            circles = d3.selectAll('.headquarter')
                .attr("transform", positionCircles)
                .style("display", "inline");

            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));
        });

        // filters	
        $("#gender").on("change", function () {
            selectedGender = this.value;

            pageData = filterByGender(data, selectedGender);
            pageData = filterByIntervention(pageData, selectedIntervention);

            // redrawing the circles
            d3.selectAll('.intersection').remove();
            circles.remove();
            circles = drawCircles(pageData);
            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            // I'll fix the formatting later :P
            if (sortBy == "alphabet") {
                pageData = pageData.sort(function (a, b) {
                    return d3.ascending(a["Project"], b["Project"]);
                });
            } else if (sortBy == "amount") {
                pageData = pageData.sort(function (a, b) {
                    return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
                });
            }

            // displays how many results
            $("#results-count").text(pageData.length);
            $('#results-plural').text(pageData.length == 1 ? "" : "s");

            // rendering the data
            renderData(pageData, colors, xScale);
        });

        $("#gender>.bubble").on("click", function () {
            $(this).hasClass("clicked") ? $(this).removeClass("clicked").addClass("unclicked") : $(this).removeClass("unclicked").addClass("clicked");

            var selectedId = $(this).attr("id");
            var indexOfGender = listOfSelectedGenders.indexOf(selectedId);

            if (indexOfGender == -1) {
                listOfSelectedGenders.push(selectedId);
            } else {
                listOfSelectedGenders.splice(indexOfGender, 1);
            }
            pageData = filterByMultipleGenders(data, listOfSelectedGenders);
            pageData = filterByMultipleAges(pageData, listOfSelectedAges);
            pageData = filterByMultipleInterventions(pageData, listOfSelectedInterventions);

            d3.selectAll('.intersection').remove();
            circles.remove();
            circles = drawCircles(pageData);

            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            // I'll fix the formatting later :P
            if (sortBy == "alphabet") {
                pageData = pageData.sort(function (a, b) {
                    return d3.ascending(a["Project"], b["Project"]);
                });
            } else if (sortBy == "amount") {
                pageData = pageData.sort(function (a, b) {
                    return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
                });
            }

            // displays how many results
            $("#results-count").text(pageData.length);
            $('#results-plural').text(pageData.length == 1 ? "" : "s");

            // rendering the data
            renderData(pageData, colors, xScale);

            console.log("show results filtered");

        });

        $("#commonRiskFactors>.bubble").on("click", function () {
            $(this).hasClass("clicked") ? $(this).removeClass("clicked").addClass("unclicked") : $(this).removeClass("unclicked").addClass("clicked");

            var selectedId = $(this).attr("id");
            var indexOfCommonRiskFactors = listOfSelectedCommonRiskFactors.indexOf(selectedId);

            if (indexOfCommonRiskFactors == -1) {
                listOfSelectedCommonRiskFactors.push(selectedId);
            } else {
                listOfSelectedCommonRiskFactors.splice(indexOfCommonRiskFactors, 1);
            }
            console.log("Bubble Clicked", listOfSelectedCommonRiskFactors);

            pageData = filterByMultipleInterventions(data, listOfSelectedInterventions);
            pageData = filterByMultipleAges(pageData, listOfSelectedAges);
            pageData = filterByMultipleGenders(pageData, listOfSelectedGenders);
            pageData = filterByMultipleCommonRiskFactors(pageData, listOfSelectedCommonRiskFactors);

            d3.selectAll('.intersection').remove();
            circles.remove();
            circles = drawCircles(pageData);

            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            // I'll fix the formatting later :P
            if (sortBy == "alphabet") {
                pageData = pageData.sort(function (a, b) {
                    return d3.ascending(a["Project"], b["Project"]);
                });
            } else if (sortBy == "amount") {
                pageData = pageData.sort(function (a, b) {
                    return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
                });
            }

            // displays how many results
            $("#results-count").text(pageData.length);
            $('#results-plural').text(pageData.length == 1 ? "" : "s");

            // rendering the data
            renderData(pageData, colors, xScale);
        });

        $("#interventionType>.bubble").on("click", function () {
            $(this).hasClass("clicked") ? $(this).removeClass("clicked").addClass("unclicked") : $(this).removeClass("unclicked").addClass("clicked");

            var selectedId = $(this).attr("id");
            var indexOfIntervention = listOfSelectedInterventions.indexOf(selectedId);

            if (indexOfIntervention == -1) {
                listOfSelectedInterventions.push(selectedId);
            } else {
                listOfSelectedInterventions.splice(indexOfIntervention, 1);
            }
            console.log(listOfSelectedInterventions);
            pageData = filterByMultipleInterventions(data, listOfSelectedInterventions);
            pageData = filterByMultipleAges(pageData, listOfSelectedAges);
            pageData = filterByMultipleGenders(pageData, listOfSelectedGenders);

            d3.selectAll('.intersection').remove();
            circles.remove();
            circles = drawCircles(pageData);

            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            // I'll fix the formatting later :P
            if (sortBy == "alphabet") {
                pageData = pageData.sort(function (a, b) {
                    return d3.ascending(a["Project"], b["Project"]);
                });
            } else if (sortBy == "amount") {
                pageData = pageData.sort(function (a, b) {
                    return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
                });
            }

            // displays how many results
            $("#results-count").text(pageData.length);
            $('#results-plural').text(pageData.length == 1 ? "" : "s");

            // rendering the data
            renderData(pageData, colors, xScale);
        });

        $("#age>.bubble").on("click", function () {
            // $(this).hasClass("clicked") ? $(this).removeClass("clicked").addClass("unclicked") : $(this).removeClass("unclicked").addClass("clicked");
            // we should only track the state of clicked (true/false), and not add a state "unclicked"
            $(this).hasClass("clicked") ? $(this).removeClass("clicked") : $(this).addClass("clicked");

            var selectedId = $(this).attr("id");
            var indexOfAge = listOfSelectedAges.indexOf(selectedId);

            if (indexOfAge == -1) {
                listOfSelectedAges.push(selectedId);
            } else {
                listOfSelectedAges.splice(indexOfAge, 1);
            }

            pageData = filterByMultipleAges(data, listOfSelectedAges);
            pageData = filterByMultipleInterventions(pageData, listOfSelectedInterventions);
            pageData = filterByMultipleGenders(pageData, listOfSelectedGenders);

            d3.selectAll('.intersection').remove();
            circles.remove();
            circles = drawCircles(pageData);

            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            // I'll fix the formatting later :P
            if (sortBy == "alphabet") {
                pageData = pageData.sort(function (a, b) {
                    return d3.ascending(a["Project"], b["Project"]);
                });
            } else if (sortBy == "amount") {
                pageData = pageData.sort(function (a, b) {
                    return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
                });
            }

            // displays how many results
            $("#results-count").text(pageData.length);
            $('#results-plural').text(pageData.length == 1 ? "" : "s");

            // rendering the data
            renderData(pageData, colors, xScale);
        });

        //Add filtered text when filtered by bubbles
        $(".bubble").on("click", function () {
            if (d3.selectAll('.clicked').nodes().length > 0) {
                $("#results-filtered").show();
                $("#results-total").text("31");
            } else {
                $("#results-filtered").hide();
            }
        });

        $("#alphabeticalSort").on("click", function () {
            sortBy = "alphabet";
            pageData = pageData.sort(function (a, b) {
                return d3.ascending(a["Project"].split(";")[1], b["Project"].split(";")[1]);
            });

            renderData(pageData, colors, xScale);

            $(".sort").removeClass("active");
            $(this).addClass("active");
        });

        $("#amountSort").on("click", function () {
            sortBy = "amount";
            pageData = pageData.sort(function (a, b) {
                return d3.descending(+a["Funding Amount"].replace(/[,$]/g, ""), +b["Funding Amount"].replace(/[,$]/g, ""));
            });

            renderData(pageData, colors, xScale);
            $(".sort").removeClass("active");
            $(this).addClass("active");
        });

        $("#timeSort").on("click", function () {
            sortBy = "time";

            pageData = pageData.sort(function (a, b) {
                return d3.descending(new parseTime(a["Project Start Date"]), new parseTime(b["Project Start Date"]));
            });

            renderData(pageData, colors, xScale);
            $(".sort").removeClass("active");
            $(this).addClass("active");
        });

        $("#searchFunded").on("keyup", function () {
            var searchPageData = [];
            //Search function
            var locateInObject = function (obj, key, find, result, currentLocation) {
                if (obj === null) return;
                result = result || { done: [], found: {} };
                if (typeof obj == 'object') {
                    result.done.push(obj);
                }
                currentLocation = currentLocation || key;
                var keys = Object.keys(obj);
                for (var k = 0; k < keys.length; ++k) {
                    var done = false;
                    for (var d = 0; d < result.done.length; ++d) {
                        if (result.done[d] === obj[keys[k]]) {
                            done = true;
                            break;
                        }
                    }
                    if (!done) {
                        var location = currentLocation + '.' + keys[k];
                        if (typeof obj[keys[k]] == 'object') {
                            locateInObject(obj[keys[k]], keys[k], find, result, location)
                        } else if ((typeof find == 'string' && obj[keys[k]].toString().indexOf(find) > -1) || (typeof find == 'function' && find(obj[keys[k]], keys[k]))) {
                            result.found[location] = obj[keys[k]];
                        }
                    }
                }
                return result.found;
            }
            // console.log("test", Object.keys(locateInObject(pageData, 'pageData', this.value)));
            var checkLocation = {};
            Object.keys(locateInObject(pageData, 'pageData', this.value)).forEach(function (val, i) {
                var searchResultLocation = val.match(/\d+/)[0];
                if (checkLocation[searchResultLocation] != 1) {
                    searchPageData.push(pageData[searchResultLocation]);
                    checkLocation[searchResultLocation] = 1
                } else {
                    return;
                }
            });
            // console.log("search", searchPageData);
            // console.log("page", pageData);

            d3.selectAll('.intersection').remove();
            //circles.transition().duration(1000).attr("r",0).remove();
            circles.remove();
            circles = drawCircles(searchPageData);
            drawGroups(".leaflet-overlay-pane svg", d3.circleCollision(circles, true));

            renderData(searchPageData, colors, xScale);
            // console.log("show results filtered");
            if (this.value == "") {
                $("#results-filtered").hide();
            } else {
                $("#results-filtered").show();
                $("#results-total").text(pageData.length);
            }
        });

        d3.selectAll(".open-map")
            .on("click", function (d) {
                // do something cool
            });
    });
});

// Getting the data from google sheets (NOT PROVIDED FOR NOW) will add once the API is setup
// var request = new XMLHttpRequest();
// var API_KEY = "AIzaSyD0w5ErZNuAyG0yWLfUaJwxpKR-3SXPJq8";
// var MAJOR_DIMENSION = "ROWS";
// var RANGE = "A:Z";
// var params = "?key=" + API_KEY;

// params += "&majorDimension=" + MAJOR_DIMENSION;

// request.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//         var rawData = JSON.parse(request.responseText).values;
//         var data = rawData.toJSON();
//         console.log(data);
//     }
// };

// request.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1sGz4xKVpIXwByMDQkDCkn04ZRe0TvRU3ycQE5qkT2Es/values/" + RANGE + params, true);
// request.send();