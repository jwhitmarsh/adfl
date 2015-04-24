var fs = require('fs');
var teams = require('../data/teams.json');
var robin = require('roundrobin');

var teamNames = [];

function main() {
    for (var i = 0; i < teams.length; i++) {
        var team = teams[i];
        teamNames.push(team.name);
    }

    teamNames = teamNames.sort(function (a, b) {
        var nameA = a.toLowerCase(), nameB = b.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });

    var result = robin(teams.length, teamNames);
    var fixturesJson = [];
    var week = 1;

    for (var j = 0; j < result.length; j += 2) {
        var round = result[j].concat(result[j + 1]);
        var roundJson = {
            week: week,
            matches: []
        };

        for (var x = 0; x < round.length; x++) {
            var match = round[x];
            if (match) {

                var matchJson = {
                    home: {
                        team: match[0],
                        score: null
                    },
                    away: {
                        team: match[1],
                        score: null
                    }
                };
                roundJson.matches.push(matchJson);
            }
        }
        fixturesJson.push(roundJson);
        week++;
    }
    //console.log(JSON.stringify(fixturesJson, null, 2));

    fs.writeFile(__dirname + '/../data/fixturestest.json', JSON.stringify(fixturesJson, null, 2), function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Fixtures generated!');
        }
    });
}

main();