exports.disasterInformation = function (connection) {
    return function (request, response) {
        var queryString = prepareDisasterFetchQuery(request.query, connection);
        connection.query(queryString, function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.status(500).send("Server error");
            } else {
                response.status(200).send(rows);
            }
        });
    };
};

exports.disasterEvent = function (connection) {
    return function (request, response) {
        var insertObject = prepareDisasterInsertObject(request.body),
        queryString = prepareDisasterInsert();
        connection.query(queryString, insertObject, function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.status(500).send("Server error");
            } else {
                queryString = prepareDisasterRegionInsert();
                insertObject = prepareDisasterRegionInsertObject(request.body, rows.insertId);
                connection.query(queryString, [insertObject], function (error, rows, fields) {
                    if (error) {
                        console.log(error);
                        response.status(500).send("Server error");
                    } else {
                        response.status(200).send(rows);
                    }
                });
            }
        });
    };
};

exports.disasterTypes = function (connection) {
    return function (request, response) {
        var queryString = 'SELECT * FROM DisasterType';
        connection.query(queryString, function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.status(500).send("Server error");
            } else {
                response.status(200).send(rows);
            }
        });
    };
};

function prepareDisasterRegionInsert () {
    return 'INSERT INTO Experienced (experienced, occuredAt) VALUES ?';
}

function prepareDisasterRegionInsertObject (parameters, disasterId) {
    var data = [];
    for (var i = 0; i < parameters.regions.length; i++) {
        data[i] = [
            disasterId || '',
            parameters.regions[i].id
        ];
    }
    console.log(parameters);
    console.log(data);
    return data;
}

function prepareDisasterFetchQuery (queryParameters, connection) {
    var queryString = 'SELECT * FROM DisasterType t, Disaster d WHERE d.type = t.id';
    if (queryParameters.name) {
        queryString += ' AND t.id = ' + connection.escape(queryParameters.type);
    }
    if (queryParameters.damage) {
        queryString += ' AND d.propertyLost >= ' + connection.escape(queryParameters.damage);
    }
    if (queryParameters.casualty) {
        queryString += ' AND d.casualty >= ' + connection.escape(queryParameters.casualty);
    }
    if (queryParameters.location) {
        queryString += ' AND d.id IN (SELECT e.experienced FROM Experienced e, Region r WHERE e.occuredAt = r.id AND (r.id=' + connection.escape(queryParameters.location[0]);
        for (var i = 1; i < queryParameters.location.length; i++) {
            queryString += ' OR r.id=' + connection.escape(queryParameters.location[i]);
        }
        queryString += '))';
    }

    return queryString;
}

function prepareDisasterInsert () {
    return 'INSERT INTO Disaster SET ?';
}

function prepareDisasterInsertObject (parameters) {
    var startDate, endDate,
    casualty = parameters.casualty || '',
    propertyLost = parameters.propertyLost || '',
    type = parameters.disasterType || '';
    startDate = (parameters.start ? new Date(parameters.start) : '');
    endDate = (parameters.start ? new Date(parameters.end) : '');
    return {
        "start":startDate,
        "end":endDate,
        "casualty":casualty,
        "propertyLost":propertyLost,
        "type":type
    };
}
