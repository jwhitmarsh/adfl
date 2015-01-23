var fs = require('fs');
var teams = require('../data/teams.json');
var robin = require('roundrobin');

var teamNames = [];

function main() {
    for (var i = 0; i < teams.length; i++) {
        var team = teams[i];
        teamNames.push(team.name);
    }

    var result = robin(teams.length, teamNames);

    var fixturesJson = [];
    var week = 1;

    for (var j = 0; j < result[0].length; j += 2) {
        var round = result[j].concat(result[j + 1]);
        var roundJson = {
            week: week,
            matches: []
        };

        for (var x = 0; x < round.length; x++) {
            var match = round[x];
            var matchJson = {
                home: {
                    team: match[0],
                    score: 0
                },
                away: {
                    team: match[1],
                    score: 0
                }
            };
            roundJson.matches.push(matchJson);
        }
        fixturesJson.push(roundJson);
        week++;
    }
    //console.log(JSON.stringify(fixturesJson, null, 2));

    fs.writeFile('fixtures2.json', JSON.stringify(fixturesJson, null, 2), function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Fixtures generated!');
        }
    });
}

main();