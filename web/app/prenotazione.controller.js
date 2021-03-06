app.
controller("PrenotazioneCtrl", function($scope, $filter, $http, $q, $window, $sce, $mdDateLocale, CONFIG, $mdDialog, $rootScope) {
    $scope.day;
    $scope.currentItem = '';
    $scope.classes = [];
    $scope.isSunday = true;
    $scope.htmlTable = "";
    $scope.all = false;
    $scope.data;
    $scope.type;
    $scope.prenotazione = $rootScope.prenotazione;

    $http.get('http://88.149.220.222/orario/api.php', {
        params: {
            search: ""
        }
    }).success(function(response) {
        $scope.classes = response.classes;
        $scope.rooms = response.rooms;
        $scope.teachers = response.teachers;
    })


    $scope.init = function(date) {
        //console.log(date);
        $scope.day = new Date(date);
        $rootScope.giornoPrenotato = $scope.day;
        $scope.isSunday = $scope.day.getDay() == 0;
        $scope.htmlTable = ($scope.isSunday) ? "<p>Non c'è scuola di domenica</p>" : "<p>Seleziona una classe, un insegnante o un'aula</p>";
    }


    $scope.getPren = function() {

    };


    $scope.getPrenotazioni = function() {
        $scope.sTeacher = undefined;
        $scope.sRoom = undefined;
        $scope.sClass = undefined;
        $scope.currentItem = $scope.sRoomType;
        
        var filteredRooms = [];
        var responses = {};

        $scope.rooms.forEach(function(element) {
            if ($scope.sRoomType == "LABORATORIO") {
                if (element[0] == "L")
                    filteredRooms.push(element);
            } else {
                if (element[0] == "A")
                    filteredRooms.push(element);
            }

        }, this);

        filteredRooms.forEach(function(element) {
            $http.get('http://88.149.220.222/orario/api.php', {
                params: {
                    room: element
                }
            }).success(function(response) {
                responses[element] = response;
                if (Object.keys(responses).length == filteredRooms.length) {
                    $scope.genTablePerTipologia(responses);
                }
            })
        }, this);
    };


    $scope.testApi3 = function() {
        $http.get('http://88.149.220.222/orario/api3.php', {
            params: {
                rooms: ""
            }
        }).success(function(response) {
            console.log(response);
        })
    }

    
    $scope.viewAll = function() {
        if ($scope.sTeacher != undefined) $scope.getOrarioTeacher();
        if ($scope.sClass != undefined) $scope.getOrarioClass();
        if ($scope.sRoom != undefined) $scope.getOrarioRoom();
    }


    $scope.genTablePerTipologia = function(responses) {
        var days = $mdDateLocale.days;

        var x = "<table class=\"table\">\
                <thead><tr>\
                    <th>&nbsp;</th>\
                    <th>1</th>\
                    <th>2</th>\
                    <th>3</th>\
                    <th>4</th>\
                    <th>5</th>\
                    <th>6</th>\
                    <th>7</th>\
                    <th>8</th>\
                    <th>9</th>\
                </tr></thead>";
        
        x += "<tbody>";

        Object.keys(responses).sort().forEach(function(key) {
            m = [ [], [], [], [], [], [] ];

            responses[key].forEach(function(a) {
                if (m[a.giorno - 1][a.ora - 1] != undefined) {
                    try {
                        if (m[a.giorno - 1][a.ora - 1].concorso == "sos" || m[a.giorno - 1][a.ora - 1].concorso[0] == "C") {
                            m[a.giorno - 1][a.ora - 1].prof = a.prof + " " + m[a.giorno - 1][a.ora - 1].prof;
                        } else {
                            m[a.giorno - 1][a.ora - 1].prof += " " + a.prof;
                        }
                    } catch (h) {
                        m[a.giorno - 1][a.ora - 1].prof += " " + a.prof;
                    }
                } else {
                    m[a.giorno - 1][a.ora - 1] = a;
                }
            });        

            for (var i = 0; i <= 8; i++) {
                if (i == $scope.day.getDay()-1) {
                    x += "<tr><td>" + key + "</td>";
                    for (var j = 0; j <= 8; j++) {
                        cella = m[i][j];
                        try {
                            x += "<td><span class='nome'>" + cella.prof.toLowerCase() + "</span><br>" + " " + cella.classe + "</td>";
                            //console.log(cella);
                        } catch (e) {
                            //x += '<td style="background-color:blue;"> </td>';
                            x += '<td><md-button class="md-raised md-primary" style="max-width:30px;min-width:30px;max-height:35px;min-height:35px;"'
                                + 'ng-click="prenotaClick(\'' + key + '\'' + ',' + (j) + ')" >P</td>';
                        }
                    }
                    x += "</tr>";
                }
            };                 
        });            
        
        x += "</tbody>";
        x += "</table>";
        $scope.htmlTable = x;
    }

    $scope.prenotaClick = function(lab, ora) {
        $rootScope.labPrenotato = lab;
        $rootScope.oraPrenotata = ora + 1;
        $rootScope.prenotazione = lab + ' ' + (ora+1) + '°ora';
        $mdDialog.show({
                templateUrl: 'tpl/dialogConfermaPrenotazione.tpl.html',
                controller: 'PrenotazioneCtrl',
                clickOutsideToClose: true,
                skipHide: true
        })
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.prenota = function() {
        /*console.log("lab prenotato:" + $rootScope.labPrenotato);
        console.log("ora prenotato:" + $rootScope.oraPrenotata);
        console.log("giorno prenotato:" + $rootScope.giornoPrenotato);*/
        var req = {
            method: 'POST',
            url: 'http://'+CONFIG.HOST+':8080/api/prenota',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: "lab="+$rootScope.labPrenotato+"&ora="+$rootScope.oraPrenotata,
            token: $rootScope.token
        };

        $http(req)
            .then(
                function(data) {
                    console.log(data);
                }
            );

        $scope.cancel();
    };

});
