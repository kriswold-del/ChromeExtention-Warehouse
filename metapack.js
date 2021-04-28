$(document).ready(function() {
  var username;
  var packingstarttime;
  var pausestarttime;
  var packingcount;
  var task;

  chrome.extension.sendMessage({
      action: "ping"
  }, function(resp) {
      username = resp.status;
  });

  var buttonStyle = "width:175px;padding:20px;margin:20px;box-shadow:inset 0px 1px 0px 0px #ffffff;background:linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);background-color:#ffffff;border-radius:6px;border:1px solid #dcdcdc;display:inline-block;cursor:pointer;color:#666666;font-family:Arial;font-size:24px;font-weight:bold;text-decoration:none;text-shadow:0px 1px 0px #ffffff;"
  var pausebuttonStyle = "box-sizing: border-box;width:250px;height:200px;padding:20px;margin:20px;box-shadow:inset 0px 1px 0px 0px #ffffff;background:linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);background-color:#ffffff;border-radius:6px;border:1px solid #dcdcdc;display:inline-block;cursor:pointer;color:#666666;font-family:Arial;font-size:24px;font-weight:bold;text-decoration:none;text-shadow:0px 1px 0px #ffffff;"

  var starticon = chrome.extension.getURL("start-xxl.png");
  var pauseicon = chrome.extension.getURL("pause-xxl.png");
  var resumeicon = chrome.extension.getURL("start-xxl.png");
  var endicon = chrome.extension.getURL("stop-3-xxl.png");
  var exiticon = chrome.extension.getURL("exit-xxl.png");
  var currentscene = 0;

  var startbutton = '<td class="menu-table-cell inactive extbuttstart"><a href="#"><img class="menu-image" src="' + starticon + '" /><br><br>Start Packing</a></td>';
  var pausebutton = '<td class="menu-table-cell inactive extbuttpause"><a href="#"><img class="menu-image" src="' + pauseicon + '" /><br><br>Pause Packing</a></td>';
  var resumebutton = '<td class="menu-table-cell inactive extbuttresume" ><a href="#"><img class="menu-image" src="' + resumeicon + '" /><br><br>Resume Packing</a></td>';
  var endbutton = '<td class="menu-table-cell inactive extbuttend"><a href="#"><img class="menu-image" src="' + endicon + '" /><br><br>End Packing</a></td>';
  var exitbutton = '<td class="menu-table-cell inactive extbuttext"><a href="#"><img class="menu-image" src="' + exiticon + '" /><br><br>Exit Packing</a></td>';

  var pausebuttonshtml;
  pausebuttonshtml =  '<button type="button" class = "Cancelled extbuttresume" style = "'+pausebuttonStyle+'">Cancelled order request</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Goodsin extbuttresume" style = "'+pausebuttonStyle+'">Attending to the Goods in shutter</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Goodsout extbuttresume" style = "'+pausebuttonStyle+'">Attending to the Goods out shutter</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Responding extbuttresume" style = "'+pausebuttonStyle+'">Requests from other department</button><br/>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Printing extbuttresume" style = "'+pausebuttonStyle+'">Printing the next batch</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Supporting extbuttresume" style = "'+pausebuttonStyle+'">Supporting a team member</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Customer extbuttresume" style = "'+pausebuttonStyle+'">Customer collection Order</button>';
  pausebuttonshtml = pausebuttonshtml + '<button type="button" class = "Toilet extbuttresume" style = "'+pausebuttonStyle+'">Toilet<br/>Break</button>';

  var manifestData = chrome.runtime.getManifest();

  $("body").append('<div id="overlay" style="background-color:rgba(0, 0, 0, 0.8);position:absolute;top:0;left:0;height:100%;width:100%;z-index:998;text-align: center;vertical-align: middle;"><div style = "margin-top:200px;">' + pausebuttonshtml + '<button type="button" class = "extbuttstart" style = "'+buttonStyle+'">Start</button><button type="button" class = "extbuttend" style = "'+buttonStyle+'">Stop</button><button type="button" class = "extbuttext" style = "'+buttonStyle+'">Exit</button></div><div style = "color:white;position:absolute;width:300px;height:20px;bottom:0px;right:25%;left:50%;margin-left:-150px;text-align: center;">'+ manifestData.name +' - version '+ manifestData.version + '</div></div>');

  $('.logout-button').before(startbutton+pausebutton+resumebutton+endbutton);

  getlocaldata();


  $('.extbuttstart').click(function(){
    setscene(2);
    packingstarttime = new Date().toLocaleString('en-GB');
    packingcount = 0;
    chrome.storage.sync.set({packingcount: packingcount}, function() {
      console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
    });
    task = "packing";
    chrome.storage.sync.set({starttime: packingstarttime}, function() {
      console.log("chromeAPI Storage key['starttime'] set to " + packingstarttime);
    });
  })

  $('.extbuttpause').click(function(){
    setscene(3);
    addrow(
      getdatefromdate(packingstarttime),
      username,
      "Packing",
      packingcount,
      gettimefromdate(packingstarttime),
      gettimefromdate(new Date().toLocaleString('en-GB')),
      ""
    )
    packingstarttime = "";
    pausestarttime = new Date().toLocaleString('en-GB');
    packingcount = 0;
    chrome.storage.sync.set({packingcount: packingcount}, function() {
      console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
    });
    task = "packing";
    chrome.storage.sync.set({starttime: packingstarttime}, function() {
      console.log("chromeAPI Storage key['starttime'] set to " + packingstarttime);
    });
    chrome.storage.sync.set({pausetime: pausestarttime}, function() {
      console.log("chromeAPI Storage key['pausetime'] set to " + pausestarttime);
    });
  })

  $('.extbuttresume').click(function(){
    var pauseReason = $(this).text();
    addrow(
      getdatefromdate(pausestarttime),
      username,
      "paused",
      0,
      gettimefromdate(pausestarttime),
      gettimefromdate(new Date().toLocaleString('en-GB')),
        pauseReason
    )
    setscene(2);
    packingcount = 0;
    chrome.storage.sync.set({packingcount: packingcount}, function() {
      console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
    });
    pausestarttime = "";
    packingstarttime = new Date().toLocaleString('en-GB');
    chrome.storage.sync.set({starttime: packingstarttime}, function() {
      console.log("chromeAPI Storage key['starttime'] set to " + packingstarttime);
    });
    chrome.storage.sync.set({pausetime: pausestarttime}, function() {
      console.log("chromeAPI Storage key['pausetime'] set to " + pausestarttime);
    });
  })

  $('.extbuttend').click(function(){
    if(currentscene == 3){
      addrow(
        getdatefromdate(pausestarttime),
        username,
        "paused",
        0,
        gettimefromdate(pausestarttime),
        gettimefromdate(new Date().toLocaleString('en-GB')),
        ""
      )
    }else{
      addrow(
        getdatefromdate(packingstarttime),
        username,
        "Packing",
        packingcount,
        gettimefromdate(packingstarttime),
        gettimefromdate(new Date().toLocaleString('en-GB')),
        ""
      )
    }
    setscene(1);
    packingstarttime = "unset";
    pausestarttime = "unset";
    packingcount = 0;
    chrome.storage.sync.set({packingcount: packingcount}, function() {
      console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
    });

    chrome.storage.sync.set({starttime: packingstarttime}, function() {
      console.log("chromeAPI Storage key['starttime'] set to " + packingstarttime);
    });
    chrome.storage.sync.set({pausetime: pausestarttime}, function() {
      console.log("chromeAPI Storage key['pausetime'] set to " + pausestarttime);
    });
  })

  $('.extbuttext').click(function(){
    window.location.href = "https://dm.metapack.com/dm/ActionServlet?action=home";
  })


  $('#textField').on("keypress", function(e) {
    if (e.keyCode == 13) {
      packingcount++;
      chrome.storage.sync.set({packingcount: packingcount}, function() {
        console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
      });
      return false; // prevent the button click from happening
    }
  });

  $('.button').click(function(){
    packingcount++;
    chrome.storage.sync.set({packingcount: packingcount}, function() {
      console.log("chromeAPI Storage key['packing count'] set to " + packingcount);
    });
  });



  function addrow(strDate, strMemberofStaff, strTaskName, intAmount, strTimestarted, strTimefinished,strNotes) {
    if((strDate != "") || (strMemberofStaff != "") || (strTaskName != "") || (intAmount != "") || (strTimestarted != "") || (strTimefinished != "")){
      var resturl = "https://script.google.com/macros/s/AKfycbzakDkooehsTcTsfWgTZWwkxrI4IWgtoUIiHf2FNW-bdDh64q5ftgfSK4FoniVzwdg0Dw/exec?";
      var args = "Date=" + strDate + "&Member of Staff=" + strMemberofStaff + "&Task Name=" + strTaskName + "&Amount=" + intAmount + "&Time started=" + strTimestarted + "&Time finished=" + strTimefinished + "&Notes=" + strNotes;
      $.ajax({
          url: resturl + args,
          dataType: 'jsonp',
          success: function(data) {
              //logger( data );
          }
      });
      console.log("Add Row = " + args);
    }else{
      console.log("Add Row = " + args);
      console.log("Add Row Error! - data not posted!");
      alert(manifestData.name + "Error!\nContact "+ manifestData.author + " Imediatly!")
    }
  }

  function getdatefromdate(objdate) {
    var strDate = objdate.split(" ")[0];
    strDate = strDate.substring(0, strDate.length - 1)
    return strDate;
  }

  function gettimefromdate(objdate) {
    var strTime = objdate.split(" ")[1] + ".000";
    return strTime;
  }

  function setscene(scenestate){
    switch(scenestate) {
      case 1:
        currentscene = 1;
        $('.extbuttend,.extbuttresume,.extbuttpause,.extbuttstart,.extbuttext').hide();
        $("#overlay").show();
        $('.extbuttstart').show();
        $('.extbuttext').show();
        console.log("Scene set to Screen " + currentscene);
        break;
      case 2:
        currentscene = 2;
        $('.extbuttend,.extbuttresume,.extbuttpause,.extbuttstart,.extbuttext').hide();
        $("#overlay").hide();
        $('.extbuttpause').show();
        $('.extbuttend').show();
        console.log("Scene set to Screen " + currentscene);
        break;
      case 3:
        currentscene = 3;
        $('.extbuttend,.extbuttresume,.extbuttpause,.extbuttstart,.extbuttext').hide();
        $("#overlay").show();
        $('.extbuttresume').show();
        console.log("Scene set to Screen " + currentscene);
        break;
      default:
        // No Scene to load
    }
  }
  function getlocaldata(){
    chrome.storage.sync.get(['starttime'], function(result) {
      packingstarttime =  result.starttime;
      if(typeof packingstarttime == 'undefined'){
        setscene(1);
        console.log("Start Time = " + packingstarttime);
      }else if(packingstarttime == ""){
        setscene(3);
        console.log("Start Time = " + packingstarttime);
      }else if (packingstarttime == "unset"){
        setscene(1);
        console.log("Start Time = " + packingstarttime);
      }else{
        setscene(2);
        console.log("Start Time = " + packingstarttime);
      }
    });
    chrome.storage.sync.get(['pausetime'], function(result) {
      pausestarttime =  result.pausetime;
      console.log("Pause Time = " + pausestarttime);
    })
    chrome.storage.sync.get(['packingcount'], function(result) {
      packingcount = result.packingcount;
      console.log("packingcount = " + packingcount);
    });
  }
})

