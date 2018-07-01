var portfolioApp=angular.module('portfolioApp',['ngRoute', 'ngAnimate', 'firebase']);


portfolioApp.config(['$routeProvider', function($routeProvider,$locationProvider){

  $routeProvider.when('/about-me',{
    templateUrl:'views/about-me.html'
  }).when('/experience',{
    templateUrl:'views/experience.html'
  }).when('/education',{
    templateUrl:'views/education.html'
  }).when('/projects',{
    templateUrl:'views/projects.html'
  }).when('/publications',{
    templateUrl:'views/publications.html'
  }).otherwise({
    redirectTo:'/'
  });


}]);


portfolioApp.service('dataService', ['$firebaseObject', function() {

 var contents=null;
    // public
      return {
        setData: function(location) {
          return new Promise(function(resolve, reject) {
            // do a thing, possibly async, then…
            var ref = firebase.database().ref(location);

            ref.orderByChild("Number").on('value',function(snapshot){
              var temp = snapshot.val();

              if(location === "about-me"){
                contents = Object.keys(temp).map(function(key) {
                  return {
                      data: key.substr(2),
                      values:temp[key].split("_"),
                      readlink:"Read more",
                      show:false
                  }
                });
              }


              else if(location === "experience"){
                contents = Object.keys(temp).map(function(key){
                  return{
                    company:key,
                    position:temp[key].Position,
                    place:temp[key].Place,
                    year:temp[key].Year,
                    technical:temp[key].Technical,
                    description:temp[key].Description.split("•"),
                    readlink:"Read more",
                    show:false
                  }
                });
              }

              else if(location === "education"){
                contents = Object.keys(temp).map(function(key){
                  return{
                    degree:temp[key].Degree,
                    university:temp[key].University,
                    year:temp[key].Year,
                    major:temp[key].Major,
                    gpa:temp[key].GPA,
                    courses:temp[key].Courses,
                    thesis:temp[key].Thesis,
                    readlink:"Read more",
                    show:false
                  }
                });
              }


              else if(location === "projects"){
                contents = Object.keys(temp).map(function(key){
                  return{
                    name:key,
                    period:temp[key].Period,
                    technical:temp[key].TS,
                    description:temp[key].Description.split("•"),
                    readlink:"Read more",
                    showtitle:true,
                    show:false
                  }
                });
              }

              else if(location === "publications"){
                contents = Object.keys(temp).map(function(key){
                  return{
                    name:key,
                    link:temp[key].Link,
                    year:temp[key].Year,
                    publisher:temp[key].Publisher,
                    showtitle:true,
                    show:false
                  }
                });
              }

              resolve("success");
            });
          });
        },

        getData:function(){
          return contents;
        },

        saveContact:function(name,company, email, message){
          var message = firebase.database().ref("contacts");
          var messageRef = message.push();
          messageRef.set({
            Name:name,
            Email:email,
            Company:company,
            Message:message
          });
        },

        saveContact:function(f_name, l_name, email, company, subject, messageleft){
          var message = firebase.database().ref("contacts");
          var messageRef = message.push();
          messageRef.set({
            First_Name:f_name,
            Last_Name:f_name,
            company:company,
            email:email,
            subject:subject,
            messageleft:messageleft
          });
        }

      };
}]);

portfolioApp.controller('navigationController', ['$scope', '$rootScope', '$location', '$window', 'dataService', function($scope,$rootScope,$location,$window,dataService){


    $rootScope.$on('$locationChangeSuccess', function() {
         $rootScope.actualLocation = $location.path();
     });

    $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
         if($rootScope.actualLocation === newLocation) {
           $rootScope.$emit('getMethod');
           dataService.setData($location.path().substr(1)).then(function(result){
           });
         }
     });

     $rootScope.$emit('getMethod');
     dataService.setData($location.path().substr(1)).then(function(result){
     });

    $scope.currentLocation= function(currentLocation){
      $rootScope.$emit('getMethod');
      dataService.setData(currentLocation).then(function(result){
      });
    };


    $scope.menu='Menu';

    $scope.navNames=[
      {
        name:'About',
        reDirectLink:'about-me'
      },
      {
        name:'Education',
        reDirectLink:'education'
      },
      {
        name:'Experience',
        reDirectLink:'experience'
      },
      {
        name:'Projects',
        reDirectLink:'projects'
      },
      {
        name:'Publications',
        reDirectLink:'publications'
      },
      {
        name:'Contact',
        reDirectLink:'contact'
      },
      ];

}]);





portfolioApp.controller('sectionController', ['$scope', '$rootScope', 'dataService', function($scope,$rootScope,dataService){

  $scope.styleContent={"display":"none"};
  $scope.styleTitle={"padding-bottom":"0px"};
  $scope.styleBoxHeight={"height":"30px"};


  $rootScope.$on('getMethod', function(){
    $scope.styleContent={"display":"none"};
    $scope.styleTitle={"padding-bottom":"0px"};
    $scope.styleBoxHeight={"height":"50px"};
  });

  $scope.showContent=function(){
      $scope.contents=dataService.getData();
      if($scope.styleContent.display==="none"){
        $scope.styleBoxHeight.height="410px";
        $scope.styleContent.height="230px";
        $scope.styleContent.display="block";
        $scope.styleTitle.paddingBottom="10px";
      }
      else{
        $scope.styleBoxHeight.height="30px";
        $scope.styleContent.display="none";
        $scope.styleTitle.paddingBottom="0px";
      }
  };

  $scope.stylePara={"display":"none"};
  $scope.readlink ="Read more";
  $scope.showPara=function(content){
    if(content.show===false){
      $scope.styleBoxHeight.height="710px";
      $scope.styleContent.height="530px";
      content.show=true;
      content.readlink ="Read less";
    }
    else{
      $scope.styleBoxHeight.height="400px";
      $scope.styleContent.height="220px";
      content.show=false;
      content.readlink ="Read more";
    }
  };

  $scope.onsubmit=function(language){
    $scope.contents.forEach(function(content){
      if(content.technical.search(new RegExp(language,"i"))<0){
        content.showtitle=false;
      }
      else{
        content.showtitle=true;
      }
    });
  }
}]);








portfolioApp.controller('formController', ['$scope', 'dataService', function($scope, dataService){

  $scope.emailPattern = /^([a-z\d\.-_]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
  var emailValidity="none";

  $scope.emailValidate=function(){
    if($scope.emailPattern.test($scope.emailVar)){
      emailValidity="valid";
    }
    else{
      emailValidity="invalid";
    }
  };


 $scope.error_email={"display":"none"};
 $scope.showsuccess = {"display":"none"};
 $scope.hideOnSuccess = {"display":"block"};
 $scope.submitForm = function(){
   if(emailValidity==="valid"){
        if(typeof $scope.messageVar === "undefined")
          $scope.messageVar =" No message";
          if(typeof $scope.subjectVar === "undefined")
            $scope.subjectVar =" No subject";


        dataService.saveContact($scope.firstName,$scope.lasName, $scope.emailVar, $scope.companyVar, $scope.subjectVar,$scope.messageVar);
        $scope.emailVar=" ";
        $scope.firstName=" ";
        $scope.lastName=" ";
        $scope.messageVar=" ";
        $scope.companyVar=" ";
        $scope.subjectVar=" ";
        emailValidity="invalid";
        $scope.error_email.display="none";
        $scope.showsuccess.display="block";
        $scope.hideOnSuccess.display="none";
        /*setTimeout(function(){
          $scope.showsuccess = false;
        },3000);*/
   }
   else if(emailValidity==="invalid"){
     $scope.error_email.display="block";
     emailValidity="invalid";
     $scope.showsuccess.display="none";
   }
 };


}]);
