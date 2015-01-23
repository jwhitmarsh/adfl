$(function () {
    getData();
});

function getData() {
    $.getJSON('data/teams.json', function (teams) {
        $.getJSON('data/fixtures2.json', function (fixtures) {
            buildLeagueTable(teams, fixtures);
            buildFixturesList(fixtures);
        });
    });
}

function buildLeagueTable(teams, fixtures) {
    var $leagueTable = $('#leagueTable'),
        $body = $leagueTable.find('tbody');

    for (var i = 0; i < teams.length; i++) {
        var team = teams[i];

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
                    }
                    else if (team.scored === team.conceeded) {
                        team.drawn++;
                        team.points += 1;
                    }
                    else {
                        team.lost++;
                    }
                }
            }
        }

        team.aggregate = team.totalScored - team.totalConceeded;
    }

    teams = teams.sort(function (x, y) {
        var n = y.points - x.points;
        if (n != 0) {
            return n;
        }

        return y.aggregate - x.aggregate;
    });

    for (var x = 0; x < teams.length; x++) {
        var t = teams[x],
            $tr = $('<tr>');

        if (t.name !== 'BYE') {
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

        $ul.append(
            $('<li>').append($('<a>').text('Week ' + round.week).attr('href', '#round' + roundNum))
        );

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
        if (match.home.score !== null) {
            $home.append($('<span class="home-score">').text(match.home.score));
            if (match.home.score > match.away.score) {
                $home.addClass('win');
            }
        }

        var $away = $('<h6>').text(match.away.team);
        if (match.away.score !== null) {
            $away.append($('<span class="away-score">').text(match.away.score));
            if (match.away.score > match.home.score) {
                $away.addClass('win');
            }
        }

        $fixture.append($home);
        $fixture.append($('<span>').text('v'));
        $fixture.append($away);

        $fixtureContainerBody.append($fixture);
    }
}

function bindNavEvents() {
    $(".nav-sidebar li a").click(function (e) {
        e.preventDefault();

        var scrollToElm = $(this).attr('href');

        $('html, body').animate({
            scrollTop: $(scrollToElm).offset().top - 70
        }, 500);
    });
}