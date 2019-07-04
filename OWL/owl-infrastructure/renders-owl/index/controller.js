$scope.date = new Date().toISOString();
$scope.tpaprojects = [];
$scope.notpaprojects = [];
$scope.finishloading = false;

var subdomain = "eagle"

function updateProjectProfile(content, dashboardURL, projectid) {
    if (content.indexOf(dashboardURL) === -1) {
        return fetch("https://www.pivotaltracker.com/services/v5/projects/" + projectid,
            {
                method: 'PUT',
                headers: {
                    'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c',
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    profile_content: content + "\n" + "----" + "\n" + "## Best practices:" + "\n" + "----" + "\n" + "This project is being audited by Eagle tool." + "\n" + "You can access the dashboard here: [Dashboard]" + "(" + dashboardURL + ")"
                })
            }
        )
    }
    else {
        return false;
    }
}

function getProject(id) {
    return fetch("https://www.pivotaltracker.com/services/v5/projects/" + id,
        {
            method: 'GET',
            headers: {
                'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
            }
        }).then(x => x.json())
}


$http({
    method: 'POST',
    url: 'https://api.github.com/graphql',
    headers: {
        'Authorization': 'bearer 7cc6467533169e239d581b91ab5a7c83457c2619',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        'Accept': 'application/vnd.github.starfox-preview+json'
    },
    data: {
        query: `query {
            viewer {
              repositories(first: 100) {
                nodes {
                  owner {
                    login
                  }
                  name
                  isPrivate
                  projects(first: 100) {
                    nodes {
                      name
                      url
                      databaseId
                    }
                  }
                }
              }
            }
          }`
    }
}).then(projectresponse => {
    var repositories = projectresponse.data.data.viewer.repositories.nodes.filter(repo => !repo.isPrivate);
    var projects = [];
    repositories.forEach(repo => {
        repo.projects.nodes.forEach(project => {
            projects.push({
                id: project.databaseId,
                pname: project.name,
                url: project.url,
                owner: repo.owner.login,
                name: repo.name
            });
        });
    });
    $http({
        method: 'GET',
        url: 'http://localhost:8081/api/v6/agreements'
    }).then(regresponse => {
        var agreements = regresponse.data;
        projects.forEach(project => {
            var found = agreements.find(agreement => agreement.id === 'tpa-' + project.id);
            if (found) {
                project.registryagreement = found;
                project.urlReporterHttps = found.context.infrastructure.reporter;
                if (!project.urlReporterHttps.startsWith("https") && project.urlReporterHttps.startsWith("http")) {
                    project.urlReporterHttps = project.urlReporterHttps.replace("http", "https");
                }
                project.urlRegistryHttps = found.context.infrastructure.registry;
                if (!project.urlRegistryHttps.startsWith("https") && project.urlRegistryHttps.startsWith("http")) {
                    project.urlRegistryHttps = project.urlRegistryHttps.replace("http", "http");
                }
                $scope.tpaprojects.push(project);
            } else {
                $scope.notpaprojects.push(project);
            }
        });
        console.log($scope.tpaprojects);
        $scope.finishloading = true;
    });
});

$scope.createTpa = function (project) {
    $http({
        method: 'GET',
        url: './renders/tpa/template.json'
    }).then(tparesponse => {
        var tpa = JSON.stringify(tparesponse.data).replace(/1010101010/g, project.pname);
        tpa = tpa.replace(/1212121212/g, project.name);
        tpa = tpa.replace(/1313131313/g, project.id);
        tpa = tpa.replace(/2323232323/g, project.owner);
        tpa = JSON.parse(tpa);
        $http({
            method: 'POST',
            url: 'http://localhost:8081/api/v6/agreements',
            data: tpa
        });
    });
}
