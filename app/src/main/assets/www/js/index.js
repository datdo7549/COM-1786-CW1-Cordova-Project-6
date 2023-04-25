/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

function warningEmptyFill() {
    alert('Please fill in property name, bedroom, date, monthly rent price and reporter name');
}

function addPropertyToDatabase(name, destination, date, requires_risk, description) {
    if(name === '' || destination === '' || date === '' || requires_risk === '') {
        warningEmptyFill();
        return;
    }
    var curDate = new Date();
    var indexTime = curDate.getTime();

    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('CREATE TABLE IF NOT EXISTS PropertiesTable (id, name, destination, date, requires_risk, description)');
        tr.executeSql('INSERT INTO PropertiesTable VALUES (?1,?2,?3,?4,?5,?6)', [indexTime, name, destination, date, requires_risk, description]);
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        window.location.href='home.html'
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function readPropertyListFromStorage() {
    await sleep(500);
    readDatabaseProperty()
}

function deletePropertyByPropertyId (id) {
    event.stopPropagation();
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('DELETE FROM PropertiesTable WHERE id LIKE '+ id, [], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        readDatabaseProperty();
    });
}


function readDatabaseProperty() {
    var properties = [];
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql("SELECT * FROM PropertiesTable", [], function(tx, results) {
        var i;
        for(i = 0; i < results.rows.length ; i++) {
            var property = {
                id : results.rows.item(i).id,
                name : results.rows.item(i).name,
                destination : results.rows.item(i).destination,
                date : results.rows.item(i).date,
                requires_risk : results.rows.item(i).requires_risk,
                description : results.rows.item(i).description,
            };
            properties.push(property);
        }

        document.getElementById('list_rent').innerHTML = properties.map(property =>
            `<div class="activity" onclick="window.location.href='details.html?id=${property.id}'">
                <div class="item-details">
                    <h2 class="item-title">${property.name}</h2>
                    <p class="item-description">${property.destination}</p>
                    <span class="item-metadata">${property.date}</span>
                </div>
                <button class="delete-button" id="btn_delete_item" onclick="event.stopPropagation(); deletePropertyByPropertyId(${property.id})">DELETE</button>
            </div>`
        ).join('');

    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}


async function readPropertyDetailFromDatabase(id) {
    await sleep(500);
    readDatabaseDetailProperty(id)
}

function readDatabaseDetailProperty(id) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql('SELECT * FROM PropertiesTable WHERE id LIKE ' + id, [], function(tx, results) {

        document.getElementById("name_trip").innerHTML = results.rows.item(0).name;
        document.getElementById("destination").innerHTML = results.rows.item(0).destination;
        document.getElementById("date").innerHTML = results.rows.item(0).date;
        document.getElementById("requires_risk").innerHTML = results.rows.item(0).requires_risk;
        document.getElementById("description").innerHTML = results.rows.item(0).description;

        console.log("Alo123: " + results.rows.item(0).name);
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}

function checkDuplicate(property, bedroom, date, furniture_types) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('SELECT * FROM PropertiesTable WHERE property LIKE \'' + property + '\'', [], function(tx, results) {
            var i;
            for(i = 0; i < results.rows.length ; i++) {
				if (property === results.rows.item(i).property && bedroom === results.rows.item(i).bedroom && date === results.rows.item(i).date && furniture_types === results.rows.item(i).furniture_types) {
					return true;
				}
            }
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('Read database OK');
        }
    );
	return false;
}


