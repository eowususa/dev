
function Particapant(_id, _name, _color) {
    this.id = _id;
    this.name = _name;
    this.color = _color;

    this.getID = function () {
        return this.id;
    }
    this.getName = function () {
        return this.name;
    }
    this.getColor = function () {
        return this.color;
    }
    this.display = function () {
        return this.id + ": " + this.name;
    }
}



/*$.LoadingOverlaySetup({
    color: "rgba(0, 0, 0, 0.1)",
    image: "loading.gif",
    //custom: "Loading",
    imagePosition: "top center",
    maxSize: "200px",
    minSize: "20px",
    resizeInterval: 0,
    size: "100%"
});*/

function ParticapantGroup() {


function getQueryString(sVar) {
	urlStr = window.location.search.substring(1);
	sv = urlStr.split("&");
	for (i=0;i< sv.length;i++) {
		ft = sv [i].split("=");
		if (ft[0] == sVar) {
			return ft[1];
		}
	}
}


    this.particapantArray = [];
    alert("");
	if(getQueryString("you") == "0000000") { this.particapantArray.push(new Particapant("0000000", "Test Participant", "black")); }    
	else if(getQueryString("you") == "LCACOSD") { this.particapantArray.push(new Particapant("LCACOSD", "City of San Diego", "blue")); }    
	else if(getQueryString("you") == "LFLLCMC") { this.particapantArray.push(new Particapant("LFLLCMC", "Lee County", "brown")); }    
	else if(getQueryString("you") == "LNVRENO") { this.particapantArray.push(new Particapant("LNVRENO", "City of Reno", "orange")); }    
	else if(getQueryString("you") == "LTNMSAA") { this.particapantArray.push(new Particapant("LTNMSAA", "Memphis-Shelby", "darkmagenta")); }    
	else if(getQueryString("you") == "SAKUAFB") { this.particapantArray.push(new Particapant("SAKUAFB", "University of Alaska", "green")); }    
	else if(getQueryString("you") == "SKSKDOT") { this.particapantArray.push(new Particapant("SKSKDOT", "Kansas DOT", "darkcyan")); }    
	else if(getQueryString("you") == "SNDNDOT") { this.particapantArray.push(new Particapant("SNDNDOT", "North Dakota DOT", "grey")); }    
	else if(getQueryString("you") == "SNCNDOT") { this.particapantArray.push(new Particapant("SNCNDOT", "North Carolina DOT", "yellow")); }    
	else if(getQueryString("you") == "SVAIEIA") { this.particapantArray.push(new Particapant("SVAIEIA", "Virginia", "lime")); }    
	else if(getQueryString("you") == "TOKCHOC") { this.particapantArray.push(new Particapant("TOKCHOC", "Choctaw Nation", "maroon")); }    

    this.getParticapantArray = function () {
        return this.particapantArray;
    }

    this.getParticapantFromID = function (particapantID) {
        var participant = null;
        $.each(this.particapantArray, function () {
            if (this.getID() == particapantID) {
                participant = this;
            }
        });
        return participant;
    }

    this.getParticapantFromName = function (particapantName) {
        var participant = null;
        $.each(this.particapantArray, function () {
            if (this.getName() == particapantName) {
                participant = this;
            }
        });
        return participant;
    }
}
/*"Flights"
"Aircrafts"
"Missions"
"Operations"*/
function DataListGroup(_partialListName, _queryString) {
    this.listName = _partialListName;
    this.queryString = _queryString;
    this.participants = new ParticapantGroup();
    this.mergedResults = null;
    var thisObject = this;

    this.getParticapants = function () {
        return this.participants;
    }
    this.load = function () {
        if (!this.mergedResults) {
            var resultsArray = [];
            $.each(this.participants.getParticapantArray(), function () {
                $.ajax({
                    url: "https://ksn2.faa.gov/faa/uasipp/portal/_api/web/lists/getbytitle('" +
                        thisObject.listName +
                        this.getID() +
                        "')/items?$" + thisObject.queryString + "&$top=20000",
                    type: "GET",
                    headers: {
                        "Accept": "application/json;odata=verbose"
                    },
                    cache: false,
                    async: false,
                    success: function (data) {
                        resultsArray.push(data.d.results);

                    }
                });
            });
            this.mergedResults = d3.merge(resultsArray);
        }
        return this.mergedResults;
    }
}


function BuildTitleSummary(dataLists) {
    var jsonResults = dataLists.load();
    var totalFlightHours = 0;
    var totalFlights = 0;
    var nestResults = d3.nest()
        .key(function (d) {
            totalFlights++;
            return d.ParticipantDesignator;
        })
        .key(function (d) {
            var flightHours = Math.abs(new Date(d.EndTime) - new Date(d.StartTime)) / 36e5;
            totalFlightHours += flightHours;
            return flightHours;
        })
        .entries(jsonResults);
    $("#summaryText").append("<p><b>Total Flights:</b> " + totalFlights + "&nbsp;&nbsp;&nbsp;<b>Total Hours:</b> " + Math.round(totalFlightHours) + "</p>");
}


function BuildParticipantVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return dataLists.getParticapants().getParticapantFromID(d.ParticipantDesignator).getName();
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(jsonResults);

    //Sort by Key
    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart1", "Participants", "Flights (" + jsonResults.length + ")", true);
    //console.log(JSON.stringify(nestResults));
}

function BuildParticipantVHoursCharts(dataLists) {
    var totalFlightHours = 0;
    var flightHours = 0;
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return dataLists.getParticapants().getParticapantFromID(d.ParticipantDesignator).getName();;
        })
        .rollup(function (values) {
            return d3.sum(values, function (v) {
                flightHours = Math.abs(new Date(v.EndTime) - new Date(v.StartTime)) / 36e5;
                totalFlightHours += flightHours;
                return flightHours;
            })
        })
        .entries(jsonResults);

    //Sort by Key
    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart2", "Participants", "Flight Hours (" + Math.round(totalFlightHours) + ")", true);
    //console.log(JSON.stringify(nestResults));
}

function BuildTimeVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var total = 0;
    var nestResults = d3.nest()
        .key(function (d) {
            var minutes = (Math.abs(new Date(d.EndTime) - new Date(d.StartTime)) / 36e5) * 60;
            if (minutes <= 29) {
                return "     0 - 29";
            } else if ((minutes >= 30) && (minutes <= 59)) {
                return "    30 - 59";
            } else if ((minutes >= 60) && (minutes <= 119)) {
                return "   60 - 119";
            } else if ((minutes >= 120) && (minutes <= 239)) {
                return "  120 - 239";
            } else if (minutes >= 240) {
                return " 240->";
            } else {
                //console.log(minutes);
                return "error";
            }
        })
        .rollup(function (v) {
            total += v.length;
            return v.length;
        })
        .entries(jsonResults);

    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart5", "Flight Duration (min.)", "Flights (" + jsonResults.length + ")", false);
    //console.log(JSON.stringify(nestResults));
}


function BuildAirspaceVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return d.OperationAirSpaceClass.substring(6, 7);
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(jsonResults);

    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });
    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart3", "Airspace Classes", "Flights (" + jsonResults.length + ")", false);
    //console.log(JSON.stringify(nestResults));
}

function BuildAirspaceVHoursCharts(dataLists) {
    var jsonResults = dataLists.load();
    var totalFlightHours = 0;
    var flightHours = 0;
    var nestResults = d3.nest()
        .key(function (d) {
            return d.OperationAirSpaceClass.substring(6, 7);
        })
        .rollup(function (values) {
            return d3.sum(values, function (v) {
                flightHours = Math.abs(new Date(v.EndTime) - new Date(v.StartTime)) / 36e5;
                totalFlightHours += flightHours;
                return flightHours;
            })
        })
        .entries(jsonResults);

    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });
    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart4", "Airspace Classes", "Hours (" + Math.round(totalFlightHours) + ")", false);
    //console.log(JSON.stringify(nestResults));
}

function BuildOperationTypeVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return d.OperationType;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(jsonResults);

    //Sort by Key
    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart6", "Operation Type", "Flights (" + jsonResults.length + ")", true);
    //console.log(JSON.stringify(nestResults));
}

function BuildIndustryTypeVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return d.IndustryType;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(jsonResults);

    //Sort by Key
    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart7", "Industry Type", "Flights (" + jsonResults.length + ")", true);
    //console.log(JSON.stringify(nestResults));
}

function BuildAircraftVFlightsCharts(dataLists) {
    var jsonResults = dataLists.load();
    var nestResults = d3.nest()
        .key(function (d) {
            return d.Aircraft;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(jsonResults);

    //Sort by Key
    nestResults.sort(function (a, b) {
        return a.key.localeCompare(b.key);
    });

    BuildBarChart(nestResults, dataLists.getParticapants(), "#chart8", "Aircraft", "Flights (" + jsonResults.length + ")", true);
    //console.log(JSON.stringify(nestResults));
}

function BuildBarChart(d3Results, participants, divID, xAxisName, yAxisName, rotateXAxisText) {
    // set the dimensions and margins of the graph
    var margin = {
        top: 40,
        right: 10,
        bottom: 55,
        left: 60
    };
    var width = 335 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
    var barPadding = 5;
    var xLableOffset = 0;

    if (rotateXAxisText) {
        margin.bottom = 150;
        height = 400 - margin.top - margin.bottom;
        xLableOffset = 80;
    }


    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(divID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");



    // Scale the range of the data in the domains
    x.domain(d3Results.map(function (d) {
        return d.key;
    }));
    y.domain([0, d3.max(d3Results, function (d) {
        return d.value;
    })]);

    // append the rectangles to the bar chart
    svg.selectAll(".bar")
        .data(d3Results)
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.key);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value)
        })
        .attr("fill", function (d) {
            var participant = participants.getParticapantFromName(d.key);
            if (participant) {
                return participant.getColor();
            } else {
                return "steelblue";
            }
        });

    //add bar value label    
    svg.selectAll("text")
        .data(d3Results)
        .enter()
        .append("text")
        .attr("x", function (d, i) {
            return i * (width / d3Results.length) + (width / d3Results.length - barPadding) / 2;
        })
        //.attr("x", function(d, i) {return i * (width / data.length);})
        .attr("y", function (d) {
            return y(d.value) - 2;
        })
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .style("font-family", "Segoe UI")

        .text(function (d) {
            return Math.round(d.value);
        });


    // add the x Axis
    if (rotateXAxisText) {
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    } else {
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
    }

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // add chart name to y Axis
    svg.append("text")
        .attr("x", margin.left * -1)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "left")
        .style("font-size", "16px")
        .style("fill", "steelblue")
        .style("font-family", "Segoe UI")
        .style("font-weight", "bold")
        .text(xAxisName + " vs " + yAxisName);

    // text label for the x axis
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + xLableOffset) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "steelblue")
        .style("font-family", "Segoe UI")
        .text(xAxisName);

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "steelblue")
        .style("font-family", "Segoe UI")
        .text(yAxisName);

}

/*class Participant {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    // Getter
    get fullName() {
        return this.calcArea();
    }
    // Method
    calcArea() {
        return this.height * this.width;
    }
}

class ParticapantGroup {


}

*/