function dispLoading(msg){
  if( msg == undefined ){
    msg = "";
  }
  var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
  if($("#loading").length == 0){
    $("body").append("<div id='loading'>" + dispMsg + "</div>");
  }
}
 
function removeLoading(){
  $("#loading").remove();
}

/*
data structure dealt with here is like
{'subscription':'free subscrioption', 'resource group name':'visazure', 'resources':{'spl-darabase':location}}
*/
var resource_array = [];
var list = [
  {'url': '/get_virtual_machine'},
  {'url': '/get_load_balancer'},
  {'url': '/get_virtual_network'},
  {'url': '/get_storage'},
  {'url': '/get_sql_database'},
  {'url': '/get_webapps'}
];

//get data
function get_json(subscription, resource_name){
  dispLoading("");  

  var doneCount = 0;
    
    for(var i=0; i < list.length; i++){
      jQuery.ajax({
        url: list[i].url,   
        type: 'POST',
        data: JSON.stringify({'subscription': subscription, 'resource_name': resource_name}) ,
        dataType: 'json',
        contentType: 'application/json'
      })
      
      .done( function(data) {
        Array.prototype.push.apply(resource_array,data["item"]["value"]);
        doneCount++;
        if(doneCount == list.length){
          console.log(resource_array);
          removeLoading();
          drawGraph(resource_array);
        }
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown) {
        console.log('Error : ' + errorThrown);
      })
    }
}
//execute get_json on page ready 
var path = location.pathname;
splitted = path.split('/');
subscription = splitted[2];
resource_name = splitted[3];
window.onload = get_json(subscription, resource_name);


function drawGraph(data){
  var $ = go.GraphObject.make;
  myDiagram =
    $(go.Diagram, "myDiagramDiv",
      {
        "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
        // position the graph in the middle of the diagram
        initialContentAlignment: go.Spot.Center,
        // allow double-click in background to create a new node
        "clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
        // allow Ctrl-G to call groupSelection()
        "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },

      });

  // define a simple Node template
  myDiagram.nodeTemplate =
    $(go.Node, "Horizontal", //how to put each elements
      { background: "#44CCFF" },
      $(go.Picture,
        { margin: 10, width: 50, height: 50, background: "white" },
        new go.Binding("source")),
      $(go.Picture,
        {source: "/static/PNG/error.png", width: 20, height: 20, background: "#44CCFF", alignment: new go.Spot(0.5, 0, -20, 0), opacity: 0.0 },
        new go.Binding("opacity", "error", function(v) { return v ? 1.0 : 0.0; })),
      $(go.TextBlock,
        "Default Text",
        { margin: 12, stroke: "white", font: "bold 16px sans-serif" },
        // TextBlock.text is data bound to the "name" attribute of the model data
        new go.Binding("text", "category")),
      //$(go.Shape, "FireHazard",
      //{ desiredSize: new go.Size(25, 25), fill: "red", alignment: new go.Spot(1, 0, 0, 0), opacity: 0.0 },
      //new go.Binding("opacity", "star", function(v) { return v ? 1.0 : 0.0; }))
    );

  myDiagram.linkTemplate =
  $(go.Link,
    { routing: go.Link.Orthogonal, corner: 5 },
    $(go.Shape, { strokeWidth: 3, stroke: "#555" })); // the link shape

  //group information
  function groupInfo(adornment) {  // takes the tooltip or context menu, not a group node data object
    var g = adornment.adornedPart;  // get the Group that the tooltip adorns
    var mems = g.memberParts.count;
    var links = 0;
    g.memberParts.each(function(part) {
      if (part instanceof go.Link) links++;
    });
    return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
  }

  myDiagram.groupTemplate =
  $(go.Group, "Vertical",
    { selectionObjectName: "PANEL"}, 
    $(go.TextBlock,
      {
        font: "bold 19px sans-serif",
        isMultiline: false,  // don't allow newlines in text
        //editable: true  // allow in-place editing by user
      },
      new go.Binding("text", "text").makeTwoWay(),
      new go.Binding("stroke", "color")),
    $(go.Picture,
      { margin: 10, width: 50, height: 50, background: "white" },
      // Picture.source is data bound to the "source" attribute of the model data
      new go.Binding("source")),
    $(go.Panel, "Auto",
      { name: "PANEL" },
      $(go.Shape, "Rectangle",  // the rectangular shape around the members
        {
          fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3,
          portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
          // allow all kinds of links from and to this port
          fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
        }),
      $(go.Placeholder, { margin: 10, background: "transparent" })  // represents where the members are
    ),
    { // this tooltip Adornment is shared by all groups
      toolTip:
        $(go.Adornment, "Auto",
          $(go.Shape, { fill: "#FFFFCC" }),
          $(go.TextBlock,
            "Default Text",  // the initial value for TextBlock.text
            // some room around the text, a larger font, and a white stroke:
            { margin: 12, stroke: "white", font: "bold 16px sans-serif" },
            // TextBlock.text is data bound to the "name" attribute of the model data
            new go.Binding("text", "name"))
        ),
      // the same context menu Adornment is shared by all groups
      //contextMenu: partContextMenu
    }
  );

  //key is the place in an array
  /*
  myDiagram.addDiagramListener("ObjectSingleClicked",
    function(e) {
      var key = e.subject.part.data.key;
      targetResource = resources["resources"][Number(key)] 
    });
  */

  var model = $(go.GraphLinksModel);

  nodeData = [];
  nodeLink = [];
  connecting = [];
  connection_strings = [];
  for(var j = 0; j<data.length; j++){
    dataJson = {};
    dataJson["key"] = String(j);
    dataJson["category"] = data[j]["category"];
    dataJson["source"] = data[j]["image"];
    dataJson["name"] = data[j]["name"];
    dataJson["id"] = data[j]["id"];
    dataJson["location"] = data[j]["location"];
    if(data[j]["category"] == "Virtual Network"){
      dataJson["isGroup"] = true;
      dataJson["address space"] = data[j]["properties"]["addressSpace"]["addressPrefixes"];
    }
    else if(data[j]["category"] == "SQL Database"){
      dataJson["server id"] = data[j]["managedBy"];
      dataJson["tier"] = data[j]["properties"]["currentSku"]["tier"];
      dataJson["capacity"] = data[j]["properties"]["currentSku"]["capacity"];
      conInfo = { "value": data[j]["server"]["properties"]["fullyQualifiedDomainName"], "key": String(j)};
      connection_strings.push(conInfo);
    }
    else if(data[j]["category"] == "Virtual Machine"){
      dataJson["size"] = data[j]["properties"]["hardwareProfile"]["vmSize"];
    }
    else if(data[j]["category"] == "Storage"){
      dataJson["tier"] = data[j]["sku"]["tier"];
    }
    else if(data[j]["category"] == "WebApps"){
      for(var i=0; i<data[j]["deployment"].length; i++){
        dataDeployer = {};
        dataDeployer["key"] = "dep" + String(i);
        dataDeployer["category"] = data[j]["deployment"][i]["properties"]["deployer"];
        nodeLink.push({"from": j, "to": dataDeployer["key"]});
        switch(dataDeployer["category"]){
          case "GitHub":
            dataDeployer["source"] = "/static/PNG/Visual Studio Team Services - GitHub_COLOR.png";
            break;
          default:
            dataDeployer["source"] = "/static/PNG/Unidentified feature object_COLOR.png";
        }
        nodeData.push(dataDeployer);
      }
      for(var i=0; i<data[j]["appauth"].length; i++){
        app = {};
        app["key"] = "app" + String(i);
        app["category"] = data[j]["appauth"][i]
        nodeLink.push({"from":j, "to": app["key"]});
        switch(app["name"]){
          case "facebook":
            app["source"] = "/static/PNG/facebook.png";
            break;
          case "google":
            app["source"] = "/static/PNG/google.png";
            break;
          case "twitter":
            app["source"] = "/static/PNG/twitter.png";
            break;
          default:
            dataDeployer["source"] = "/static/PNG/Unidentified feature object_COLOR.png";
        }
        nodeData.push(app);
      }
      for(key in data[j]["connection string"]){
        console.log(data[j]["connection string"]);
        connecto = data[j]["connection string"][key]["value"];
        if(connecto != undefined){
          connecto = connecto.split(',')[0].split(':')[1];
          conInfo = { "value":connecto, "key": String(j)};
          connecting.push(conInfo);
        }
      }
    }
    nodeData.push(dataJson);
  }
  for(var i=0; i<connecting.length; i++){
    for(var j=0; j<connection_strings.length; j++){
      if(connecting[i]["value"] == connection_strings[j]["value"]){
        nodeLink.push({"from": connecting[i]["key"], "to": connection_strings[j]["key"]});
      } 
    }
  }

  model.nodeDataArray = nodeData;
  /*
  [ 
    { key:"1", name: "Azure App Service", "source": "/static/PNG/Azure App Service.png", group: 5 },
    { key:"2", name: "Azure SQL Database", "source": "/static/PNG/Azure SQL Database.png", gruop: 5},
    { key:"3", name: "Azure Virtual Machine",  "source": "/static/PNG/Azure Virtual Machine 2_COLOR.png", group: 5},
    { key:"4", name: "GitHub", "source": "/static/PNG/Visual Studio Team Services - GitHub_COLOR.png"},
    { key:"5", name: "Azure Virtual Network.png", "source":"/static/PNG/Azure Virtual Network.png", isGroup: true}
  ];
  */


  model.linkDataArray = nodeLink;
  /*
   [
    { from: 1, to: 2},
    { from: 2, to: 2},
    { from: 3, to: 4},
    { from: 3, to: 1}
  ];
  */
  myDiagram.model = model;

  myDiagram.select(myDiagram.nodes.first());

  var inspector = new Inspector('myInspectorDiv', myDiagram,
  {
    properties: {
      "category": { readOnly: true, show: Inspector.showIfPresent },
      "name": { readOnly: true, show: Inspector.showIfPresent },
      "id": { readOnly: true, show: Inspector.showIfPresent },
      "location": { readOnly: true, show: Inspector.showIfPresent  },
      "address space": { readOnly: true, show: Inspector.showIfPresent },
      "server id" : {readOnly: true, show: Inspector.showIfPresent },
      "capacity" : {readOnly: true, show: Inspector.showIfPresent },
      "tier" : { readOnly: true, show: Inspector.showIfNode},
      "size" : {readOnly: true, show: Inspector.showIfNode }, 
      "LinkComments": { show: Inspector.showIfLink },
      "isGroup": { readOnly: true, show: Inspector.showIfPresent },
      "flag": { show: Inspector.showIfNode, type: 'checkbox' },
      /*"state": {
        show: Inspector.showIfNode,
        type: "select",
        choices: function(node, propName) {
          if (Array.isArray(node.data.choices)) return node.data.choices;
          return ["one", "two", "three", "four", "five"];
        }
      },*/
      "choices": { show: false },  
    }
  });
}

function showError(){
  nodeData = myDiagram.model.nodeDataArray;
  category_for_error = ['WebApps', 'SQL Database'];
  var doneCount = 0;
  figure = [];
  myDiagram.startTransaction("addError");
  for(var i=0; i < nodeData.length; i++){
    category = nodeData[i]["category"];
    if(category_for_error.indexOf(category) != -1 ){
      jQuery.ajax({
        url: "/get_error",   
        type: 'POST',
        data: JSON.stringify({'id': nodeData[i]["id"], 'category': category, 'num': i}) ,
        dataType: 'json',
        contentType: 'application/json'
      })
      .done( function(data) {
        console.log(data["item"]["judge"])
        myDiagram.model.nodeDataArray[data["num"]]["error"] = data["item"]["judge"];
        doneCount++;
        console.log(doneCount);
        if(doneCount == nodeData.length){
          console.log(myDiagram.model.nodeDataArray);
          myDiagram.commitTransaction("addError");
          myDiagram.select(myDiagram.nodes.first());
          var inspector = new Inspector('myInspectorDiv', myDiagram,
          {
            properties: {
              "category": { readOnly: true, show: Inspector.showIfPresent },
              "name": { readOnly: true, show: Inspector.showIfPresent },
              "id": { readOnly: true, show: Inspector.showIfPresent },
              "location": { readOnly: true, show: Inspector.showIfPresent  },
              "address space": { readOnly: true, show: Inspector.showIfPresent },
              "server id" : {readOnly: true, show: Inspector.showIfPresent },
              "capacity" : {readOnly: true, show: Inspector.showIfPresent },
              "tier" : { readOnly: true, show: Inspector.showIfPresent},
              "size" : {readOnly: true, show: Inspector.showIfPresent }, 
              "error": {readOnly: true, show: Inspector.showIfPresent },
              "LinkComments": { show: Inspector.showIfLink },
              "isGroup": { readOnly: true, show: Inspector.showIfPresent },
              "flag": { show: Inspector.showIfNode, type: 'checkbox' },
              /*"state": {
                show: Inspector.showIfNode,
                type: "select",
                choices: function(node, propName) {
                  if (Array.isArray(node.data.choices)) return node.data.choices;
                  return ["one", "two", "three", "four", "five"];
                }
              },*/
              "choices": { show: false },  
            }
          });
        }
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown) {
        console.log('Error : ' + errorThrown);
      })
    }else{
      doneCount++;
    }
  }
}


function addWarning(){

}