$(function () {
    $.ajaxSetup({cache: false});
    getData();
});

var _teams;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getData() {
    var season = getParameterByName('season');
    var teamsJson = 'data/teams.json';
    var fixturesJson = 'data/fixtures.json';

    switch (season) {
        case '1' :
            teamsJson = 'data/archive/season1/teams.json';
            fixturesJson = 'data/archive/season1/fixtures.json';
            break;
        default:
            break;
    }

    $.getJSON(teamsJson, function (teams) {
        _teams = teams;
        $.getJSON(fixturesJson, function (fixtures) {
            buildLeagueTable(teams, fixtures);
            buildFixturesList(fixtures);
        });
    });
}

function buildLeagueTable(teams, fixtures) {
    var $leagueTable = $('#leagueTable'),
        $body = $leagueTable.find('tbody'),
        $teamSelect = $('#teamSelect');

    var alphaSortedTeams = teams.sort(function (x, y) {
        var nameA = x.name.toLowerCase(), nameB = y.name.toLowerCase()
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0;
    });

    for (var at = 0; at < alphaSortedTeams.length; at++) {
        $teamSelect.append($('<option>').val(alphaSortedTeams[at].id).text(alphaSortedTeams[at].name));
    }

    $teamSelect.on('change', function () {
        var id = $(this).val();
        console.log(id);
        var $fixtures = $('.fixture');
        if (id === '-1') {
            $fixtures.show();
        } else {
            $fixtures.hide();
            $fixtures.each(function () {
                var ids = $(this).attr('data-team-ids').split(',');
                if (ids === undefined) {
                    console.error($(this));
                }
                if (parseInt(ids[0]) == parseInt(id) || parseInt(ids[1]) == parseInt(id)) {
                    $(this).show();
                }
            });
        }
    });

    for (var i = 0; i < teams.length; i++) {
        var team = teams[i];

        if (team.name !== 'BYE') {
            var teamName = team.name;
            if (team.seeded) {
                teamName += '<i class="fa fa-star"></i>';
            }

            var $tr = $('<tr>');
            $tr.append($('<td>').html(teamName));
            $tr.append($('<td>').text(team.p1));
            $tr.append($('<td>').text(team.p2));

        }


        var teamFixtures = getTeamFixtures(team, fixtures);

        team.played = 0;
        team.won = 0;
        team.lost = 0;
        team.drawn = 0;
        team.scored = 0;
        team.conceeded = 0;
        team.points = 0;
        team.totalScored = 0;
        team.totalConceeded = 0;
        team.aggregate = 0;
        team.form = [];
        team.nextOpponent = null;

        for (var j = 0; j < teamFixtures.length; j++) {
            var round = teamFixtures[j];

            for (var k = 0; k < round.length; k++) {
                var fixture = round[k];

                if (fixture.home.score !== null) {
                    team.played++;
                    if (fixture.home.team === team.name) {
                        team.scored = fixture.home.score;
                        team.conceeded = fixture.away.score;
                    } else {
                        team.scored = fixture.away.score;
                        team.conceeded = fixture.home.score;
                    }

                    team.totalScored += team.scored;
                    team.totalConceeded += team.conceeded;

                    if (team.scored > team.conceeded) {
                        team.won++;
                        team.points += 3;
                        team.form.push('W');
                    }
                    else if (team.scored === team.conceeded) {
                        team.drawn++;
                        team.points += 1;
                        team.form.push("D");
                    }
                    else {
                        team.lost++;
                        team.form.push("L");
                    }
                } else {
                    if (team.name !== 'BYE' && !team.nextOpponent && fixture.home.team === team.name && fixture.away.team !== 'BYE') {
                        team.nextOpponent = fixture.away.team;
                    }
                    if (team.name !== 'BYE' && !team.nextOpponent && fixture.away.team === team.name && fixture.home.team !== 'BYE') {
                        team.nextOpponent = fixture.home.team;
                    }
                }
            }
        }

        if (team.name !== 'BYE') {
            if (team.form) {
                $tr.append($('<td>').text(team.form.toString()));
            }
            $tr.append($('<td>').text(team.nextOpponent));
        }

        $('#TeamsContainer').find('tbody').append($tr);

        team.aggregate = team.totalScored - team.totalConceeded;
    }

    teams = teams.sort(function (x, y) {
        var points = y.points - x.points;
        if (points != 0) {
            if (y.played == 0) {
                return -1;
            }
            if (x.played == 0) {
                return 1;
            }
            return points;
        }

        var agg = y.aggregate - x.aggregate;
        if (agg != 0) {
            if (y.played == 0) {
                return -1;
            }
            if (x.played == 0) {
                return 1;
            }
            return agg;
        }

        var score = y.scored - x.scored;
        if (score != 0) {
            if (y.played == 0) {
                return -1;
            }
            if (x.played == 0) {
                return 1;
            }
            return score;
        }

        var conceeded = y.conceeded - x.conceeded;
        if (conceeded != 0) {
            if (y.played == 0) {
                return -1;
            }
            if (x.played == 0) {
                return 1;
            }
            return conceeded;
        }

        var nameA = x.name.toLowerCase(), nameB = y.name.toLowerCase()
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0;
    });

    var filteredTeams = teams.filter(function (x) {
        return x.name !== 'BYE';
    });

    for (var x = 0; x < filteredTeams.length; x++) {
        var t = filteredTeams[x],
            $tr = $('<tr>');
        $tr
            .append($('<td>').text(x + 1))
            .append($('<td>').text(t.name))
            .append($('<td>').text(t.played))
            .append($('<td>').text(t.won))
            .append($('<td>').text(t.lost))
            .append($('<td>').text(t.drawn))
            .append($('<td>').text(t.points))
            .append($('<td>').text(t.totalScored))
            .append($('<td>').text(t.totalConceeded))
            .append($('<td>').text(t.aggregate));

        $body.append($tr);
    }
}

function getTeamFixtures(team, fixtures) {
    var teamFixtures = [];
    for (var j = 0; j < fixtures.length; j++) {
        var round = fixtures[j];

        var filteredFixtures = round.matches.filter(function (x) {
            return x.home.team === team.name || x.away.team === team.name;
        });
        teamFixtures.push(filteredFixtures);
    }
    return teamFixtures;
}

function buildFixturesList(fixturesData) {
    var $ul = $('#NavSide');
    var $fixturesContainer = $('#FixturesContiainer');

    for (var i = 0; i < fixturesData.length; i++) {
        var round = fixturesData[i],
            roundNum = i + 1;

        var deadline = new Date(round.deadline);

        var $li = $('<li>').append($('<a>').text('Week ' + round.week).attr('href', '#round' + roundNum)
            .append($('<span class="deadline">').text('(Deadline: ' + deadline.toDateString() + ')')));
        $ul.append($li);

        var $fixtureContainer = $('<div class="panel">');
        $fixtureContainer.attr('id', 'round' + roundNum);

        var $fixtureContainerBody = $('<div class="panel-body">');
        $fixtureContainerBody.append($('<h3>').text('Week ' + round.week));

        makeFixtures(round, $fixtureContainerBody);

        $fixtureContainer.append($fixtureContainerBody);
        $fixturesContainer.append($fixtureContainer);
    }

    bindNavEvents();
}

function makeFixtures(round, $fixtureContainerBody) {
    for (var f = 0; f < round.matches.length; f++) {

        var match = round.matches[f];
        var $fixture = $('<div class="fixture">');
        var $home = $('<h6>').text(match.home.team);
        var $away = $('<h6>').text(match.away.team);


        var resultClass = 'lose';
        if (match.home.score !== null) {
            $home.append($('<span class="home-score">').text(match.home.score));
            if (match.home.score > match.away.score) {
                resultClass = 'win';
            } else if (match.home.score === match.away.score) {
                resultClass = 'draw';
            }
            $home.addClass(resultClass);
        }

        resultClass = 'lose';
        if (match.away.score !== null) {
            $away.append($('<span class="away-score">').text(match.away.score));
            if (match.away.score > match.home.score) {
                resultClass = 'win';
            } else if (match.home.score === match.away.score) {
                resultClass = 'draw';
            }
            $away.addClass(resultClass);
        }

        if (match.home.team === 'BYE' || match.away.team === 'BYE') {
            $home.addClass('bye');
            $away.addClass('bye');
        }

        var homeDetails = _teams.filter(function (t) {
            return t.name == match.home.team;
        });

        var awayDetails = _teams.filter(function (t) {
            return t.name == match.away.team;
        });

        $fixture.attr('data-team-ids', [homeDetails[0].id, awayDetails[0].id]);

        $home.popover({
            content: homeDetails[0].p1 + ' & ' + homeDetails[0].p2,
            trigger: 'hover',
            placement: 'top'
        });

        $away.popover({
            content: awayDetails[0].p1 + ' & ' + awayDetails[0].p2,
            trigger: 'hover',
            placement: 'top'
        });

        $fixture.append($home);
        $fixture.append($('<span>').text('v'));
        $fixture.append($away);

        $fixtureContainerBody.append($fixture);
    }
}

function bindNavEvents() {
    $("#NavSide li a").click(function (e) {
        e.preventDefault();

        var scrollToElm = $(this).attr('href');

        $('html, body').animate({
            scrollTop: $(scrollToElm).offset().top - 70
        }, 500);
    });
}