$(document).ready(function() {

  var STRDEV = 0;
  var displaylogs = 1;
  var buffersecs = 13;
  function logger(strlog){
    if(displaylogs == 1){
      console.log(strlog);
    }
  }
  var arrTaskArray = [];
  var username;
  var autotaskstart;
  var taskname = "Email's Sent";

  chrome.extension.sendMessage({
      action: "ping"
  }, function(resp) {
      username = resp.status;
  });

  $('head').append('<style>\
    .krisbutton {\
      display: inline-block;\
      border-radius: 10px;\
      border: 4px double #cccccc;\
      color: #eeeeee;\
      text-align: center;\
      font-size: 12px;\
      padding: 10px;\
      min-width: 100px;\
      -webkit-transition: all 0.5s;\
      -moz-transition: all 0.5s;\
      -o-transition: all 0.5s;\
      transition: all 0.5s;\
      cursor: pointer;\
      margin: 5px;\
    }\
    .kwmodal {\
        display: none; /* Hidden by default */\
        position: fixed; /* Stay in place */\
        z-index: 1; /* Sit on top */\
        left: 0;\
        top: 0;\
        width: 100%; /* Full width */\
        height: 100%; /* Full height */\
        overflow: auto; /* Enable scroll if needed */\
        background-color: rgb(0,0,0); /* Fallback color */\
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */\
        z-index:20000;\
      }\
      .kwmodal-content {\
        background-color: #fefefe;\
        margin: 15% auto; /* 15% from the top and centered */\
        padding: 20px;\
        border: 1px solid #888;\
        width: 80%; /* Could be more or less, depending on screen size */\
      }\
      #kwclose {\
        color: #aaa;\
        float: right;\
        font-size: 28px;\
        font-weight: bold;\
      }\
      #kwclose:hover,#kwclose:focus {\
    color: black;\
    text-decoration: none;\
    cursor: pointer;\
    }\
    #KS_NS_BAR{\
      width:10%;\
      margin-left: 45%;\
      background-color: #575073;\
      position:fixed;\
      min-height:20px;\
      top:1;\
      z-index:9999;\
      font-family: "Times New Roman", Times, serif;\
      font-size:12px;\
    }\
    #KS_NS_BAR select{\
      width:200px;\
    }\
    #KS_NS_BAR table{\
      width:auto;\
      color:white;\
    }\
    #KS_NS_BAR table tr td{\
      font-family: "Times New Roman", Times, serif;\
      font-size:12px;\
      color:white;\
    }\
    .KWfault{\
        background-color: #e8272b;\
    }\
    .KWtask{\
        background-color: #0f7bba;\
    }\
    .KWtask:disabled{\
      background-color: #afb8bd;\
  }\
  .KWfault:disabled{\
    background-color: #b5a39f;\
}\
')

  $('html').prepend('\
<div id = "KS_NS_BAR">\
<div id = "showhide" style = "display:block;">\
<select class = "" name = "tasktext" id = "tasktext" style = "margin-left:10px;"></select>\
<button type="button" class = "krisbutton KWtask" id = "add_Task" >Start Task</button>\
<button type="button" class = "krisbutton KWfault" id = "ClearData" >Clear from Cache</button>\
<table style = "float:right;"><thead><tr><th>Task</th><th>Start Time</th><th>User</th><th>Total</th><th>Notes</th><th>Options</th></tr></thead><tbody id = "taskbody"></tbody></table>\
</div>\
</div>\
');

  $("#showhide").hide();


  function loaddata() {
      $('#taskbody').html("");
      chrome.storage.sync.get(["tasks"], function(items) {
          arrTaskArray = items["tasks"];
          var length = items["tasks"].length;
          for (var i = 0; i < length; i++) {
              $('#taskbody').append('\
      <tr><td>' + items.tasks[i][0] + '</td><td>' + items.tasks[i][2] + '</td><td>' + items.tasks[i][1] + '</td><td><input type = "text" id = "numberval" style = "width:50px;" value = "' + items.tasks[i][4] + '"></input></td><td>' + items.tasks[i][5] + '</td><td>' + items.tasks[i][3] + '</td></tr>\
        ');
          }
      })
  }

  $(document).on("click", "#numberval", function(event) {
      $(this).val(parseInt($(this).val()) + 1);
      arrTaskArray[$(this).parent().parent().index()][4] = parseInt($(this).val());
      chrome.storage.sync.set({
          "tasks": arrTaskArray
      }, function() {});
  });

  function getdatefromdate(objdate) {
      var strDate = objdate.split(" ")[0];
      strDate = strDate.substring(0, strDate.length - 1)
      return strDate;
  }

  function gettimefromdate(objdate) {
      var strTime = objdate.split(" ")[1] + ".000";
      return strTime;
  }

  $(document).on("click", "#pauseresume", function(event) {
      if ($(this).html() == "Pause") {
          $(this).html("Resume");
          //new Date().toLocaleString('en-GB')'
      } else {
          $(this).html("Pause");
      }
      var i;
      for (i = 0; i < arrTaskArray.length; ++i) {
          if (arrTaskArray[i][3] == '<button id = "pauseresume">Pause</button><button id = "end">end task</button>') {
              addrow(
                  getdatefromdate(arrTaskArray[i][2]),
                  username,
                  arrTaskArray[i][0],
                  arrTaskArray[i][4],
                  gettimefromdate(arrTaskArray[i][2]),
                  gettimefromdate(new Date().toLocaleString('en-GB')),
                  arrTaskArray[i][5]
              )
              arrTaskArray[$(this).parent().parent().index()][4] = 0;
          }
          arrTaskArray[i][3] = '<button id = "pauseresume">Resume</button><button id = "end">end task</button>';
          arrTaskArray[$(this).parent().parent().index()][4] = 1;
      }
      arrTaskArray[$(this).parent().parent().index()][2] = new Date().toLocaleString('en-GB');
      arrTaskArray[$(this).parent().parent().index()][3] = '<button id = "pauseresume">' + $(this).html() + '</button><button id = "end">end task</button>';
      savevals();
  });

  function addrow(strDate, strMemberofStaff, strTaskName, intAmount, strTimestarted, strTimefinished,strNotes) {
    if(STRDEV  == 1){
      logger("Add Row");
      logger(arguments);
    }
      var resturl = "https://script.google.com/macros/s/AKfycbwvrXSbv93kgCQxD5lAGd7Gj3DAUcNlnXSuKyynCW8g8ywOknmoY1qI7XeZ0LZgu3UDKw/exec?";
      var args = "Date=" + strDate + "&Member of Staff=" + strMemberofStaff + "&Task Name=" + strTaskName + "&Amount=" + intAmount + "&Time started=" + strTimestarted + "&Time finished=" + strTimefinished + "&Notes=" + strNotes;
      $.ajax({
          url: resturl + args,
          dataType: 'jsonp',
          success: function(data) {
              //logger( data );
          }
      });
      logger(resturl + args);
  }

  $(document).on("click", "#end", function(event) {
      i = $(this).parent().parent().index();
      addrow(
          getdatefromdate(arrTaskArray[i][2]),
          username,
          arrTaskArray[i][0],
          arrTaskArray[i][4],
          gettimefromdate(arrTaskArray[i][2]),
          gettimefromdate(new Date().toLocaleString('en-GB')),
          arrTaskArray[i][5]
      )
      arrTaskArray.splice($(this).parent().parent().index(), 1);
      savevals();
  });



  function savevals() {
      chrome.storage.sync.set({
          "tasks": arrTaskArray
      }, function() {
          loaddata();
      });
  }

  loaddata();

  $(window).focus(function() {
      $("#showhide").slideUp("fast", function() {collapsnav();})
  });

  $("#add_Task").click(function() {
      var tasknameelement = document.getElementById("tasktext");
      var Notes;
      taskname = tasknameelement.options[tasknameelement.selectedIndex].text;
      if(taskname == "Ad-hoc tasks (Notes required)"){
        Notes = prompt("Please enter the Adhoc Task Name", "Task Name");
      var i;
      for (i = 0; i < arrTaskArray.length; ++i) {
          if (arrTaskArray[i][0] == taskname) {
              alert("Task already Active! Please resume form list");
              return;
          } else {
              if (arrTaskArray[i][3] == '<button id = "pauseresume">Pause</button><button id = "end">end task</button>') {
                  addrow(
                      getdatefromdate(arrTaskArray[i][2]),
                      username,
                      arrTaskArray[i][0],
                      arrTaskArray[i][4],
                      gettimefromdate(arrTaskArray[i][2]),
                      gettimefromdate(new Date().toLocaleString('en-GB')),
                      arrTaskArray[i][5]
                  )
                  arrTaskArray[$(this).parent().parent().index()][4] = 0;
              }
              arrTaskArray[i][3] = '<button id = "pauseresume">Resume</button><button id = "end">end task</button>';
          }
      }
      arrTaskArray.push(Array(taskname, username, new Date().toLocaleString('en-GB'), '<button id = "pauseresume">Pause</button><button id = "end">end task</button>', 1,Notes));
      chrome.storage.sync.set({
          "tasks": arrTaskArray
      }, function() {
          loaddata();
      });
    }else{
      Notes = "";
      var i;
      for (i = 0; i < arrTaskArray.length; ++i) {
          if (arrTaskArray[i][0] == taskname) {
              alert("Task already Active! Please resume form list");
              return;
          } else {
              if (arrTaskArray[i][3] == '<button id = "pauseresume">Pause</button><button id = "end">end task</button>') {
                  addrow(
                      getdatefromdate(arrTaskArray[i][2]),
                      username,
                      arrTaskArray[i][0],
                      arrTaskArray[i][4],
                      gettimefromdate(arrTaskArray[i][2]),
                      gettimefromdate(new Date().toLocaleString('en-GB')),
                      arrTaskArray[i][5]
                  )
                  arrTaskArray[$(this).parent().parent().index()][4] = 0;
              }
              arrTaskArray[i][3] = '<button id = "pauseresume">Resume</button><button id = "end">end task</button>';
          }
      }
      arrTaskArray.push(Array(taskname, username, new Date().toLocaleString('en-GB'), '<button id = "pauseresume">Pause</button><button id = "end">end task</button>', 1,Notes));
      chrome.storage.sync.set({
          "tasks": arrTaskArray
      }, function() {
          loaddata();
      });
    } 
  });

  $("#toggle").click(function() {
      $("#showhide").toggle();
      collapsnav();
  });

  function expandnav(){
    $('#KS_NS_BAR').css('width','100%');
    $('#KS_NS_BAR').css('margin-left','0px');
  }

  function collapsnav(){
    $('#KS_NS_BAR').css('width','10%');
    $('#KS_NS_BAR').css('margin-left','45%');
  }
  $('#KS_NS_BAR').mouseover(function() {
      if ($('#showhide').css('display') == 'none' || $('#showhide').css("visibility") == "hidden") {
          $('#taskbody').html("");
          expandnav();
          loaddata();
          $("#showhide").slideDown("fast", function() {});
      }
  })

  $('body').click(function() {
    
      $("#showhide").slideUp("fast", function() {
        collapsnav();
      });
  })

  $("#ClearData").click(function() {
      arrTaskArray = [];
      chrome.storage.sync.set({
          "tasks": arrTaskArray
      }, function() {

      })
      chrome.storage.local.set({'emailopen':'false'});
      loaddata();
  })
var url = "https://spreadsheets.google.com/feeds/list/1KfEnLkaYJmoKACfgRZIR4Pgm3j8N5h_SxD6yfgwY3fs/1/public/values?alt=json";
  $.getJSON(url, function(data) {
      var entry = data.feed.entry;
      $(entry).each(function() {
          var o = new Option(this.gsx$tasks.$t, this.gsx$tasks.$t);
          $("#tasktext").append('<option value=1>' + this.gsx$tasks.$t + '</option>');
      });
  });

})