$(function () {
    getLeagueTable();
    getFixturesList();
});

function getLeagueTable() {
    $.getJSON('data/teams.json', function (json) {
        buildLeagueTable(json);
    });
}

function getFixturesList() {
    $.getJSON('data/fixtures.json', function (json) {
        buildFixturesList(json);
    });
}

function buildLeagueTable(data) {
    var $leagueTable = $('#leagueTable'),
        $body = $leagueTable.find('tbody');

    for (var i = 0; i < data.length; i++) {
        var d = data[i],
            $tr = $('<tr>');

        $tr
            .append($('<td>').text(i + 1))
            .append($('<td>').text(d.name))
            .append($('<td>').text(d.played))
            .append($('<td>').text(d.won))
            .append($('<td>').text(d.lost))
            .append($('<td>').text(d.drawn))
            .append($('<td>').text(d.points))
            .append($('<td>').text(d.gs))
            .append($('<td>').text(d.ga))
            .append($('<td>').text(d.gs - d.ga));

        $body.append($tr);
    }
}

function buildFixturesList(data) {
    var $ul = $('#NavSide');
    var $fixturesContainer = $('#FixturesContiainer');

    for (var i = 0; i < data.length; i++) {
        var round = data[i],
            roundNum = i + 1;

        $ul.append(
            $('<li>').append($('<a>').text('Week ' + roundNum).attr('href', '#round' + roundNum))
        );

        var $fixtureContainer = $('<div class="panel">');
        $fixtureContainer.attr('id', 'round' + roundNum);

        var $fixtureContainerBody = $('<div class="panel-body">');
        $fixtureContainerBody.append($('<h3>').text('Round ' + roundNum));

        makeFixtures(round, $fixtureContainerBody);
        makeFixtures(data[i + 1], $fixtureContainerBody);

        $fixtureContainer.append($fixtureContainerBody);
        $fixturesContainer.append($fixtureContainer);
    }

    bindNavEvents();
}

function makeFixtures(round, $fixtureContainerBody) {
    for (var f = 0; f < round.length; f++) {
        var fixture = round[f];

        var $fixture = $('<div class="fixture">');
        $fixture.append($('<h6>').text(fixture[0]));
        $fixture.append($('<span>').text('v'));
        $fixture.append($('<h6>').text(fixture[1]));

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