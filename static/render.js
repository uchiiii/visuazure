/*
 * This is for each resource group page and 
 * the baic fuctionality is to fetch data from the ARM via server 
 * and visualize it 
 *   
 */

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

var resource_array = [];
var list = [
  {'url': '/get_virtual_machine'},
  {'url': '/get_load_balancer'},
  {'url': '/get_virtual_network'},
  {'url': '/get_storage'},
  {'url': '/get_sql_database'},
  {'url': '/get_webapps'}
];

//execute get_json on page ready 
var path = location.pathname;
splitted = path.split('/');
subscription = splitted[2];
resource_name = splitted[3];
window.onload = get_json(subscription, resource_name);

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

function drawGraph(data){
  var $ = go.GraphObject.make;
  myDiagram =
    $(go.Diagram, "myDiagramDiv",
      {
        "undoManager.isEnabled": true, 
        initialContentAlignment: go.Spot.Center,
        "clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
        "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },

      });

  // define a simple Node template
  myDiagram.nodeTemplate =
    $(go.Node, "Horizontal", 
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
        new go.Binding("text", "category")),
    );

  myDiagram.linkTemplate =
  $(go.Link,
    { routing: go.Link.Orthogonal, corner: 5 },
    $(go.Shape, { strokeWidth: 3, stroke: "#555" })); 

  //group information
  function groupInfo(adornment) {
    var g = adornment.adornedPart;  
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
        isMultiline: false,  
      },
      new go.Binding("text", "text").makeTwoWay(),
      new go.Binding("stroke", "color")),
    $(go.Picture,
      { margin: 10, width: 50, height: 50, background: "white" },
      new go.Binding("source")),
    $(go.Panel, "Auto",
      { name: "PANEL" },
      $(go.Shape, "Rectangle", 
        {
          fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3,
          portId: "", cursor: "pointer",  
          fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
        }),
      $(go.Placeholder, { margin: 10, background: "transparent" }) 
    ),
    {
      toolTip:
        $(go.Adornment, "Auto",
          $(go.Shape, { fill: "#FFFFCC" }),
          $(go.TextBlock,
            "Default Text",  
            { margin: 12, stroke: "white", font: "bold 16px sans-serif" },
            new go.Binding("text", "name"))
        ),
    }
  );

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
      if(data[j]["properties"]["subnets"] != undefined){
        subnets = data[j]["properties"]["subnets"];
        for(var i=0; i<subnets.length; i++){
          gateway = {};
          gateway["key"] = "gateway" + String(i);
          gateway["group"] = j;
          gateway["subnet"] = subnets[i]["name"]
          gateway["subnet address prefixes"] =  subnets[i]["properties"]["addressPrefix"];
          if(subnets[i]["properties"]["ipconfig"] != undefined){
            gateway["category"] = "Gateway";
            gateway["source"] = "/static/PNG/Azure VPN Gateway_color.png";
            gateway["id"] = subnets[i]["properties"]["ipconfig"]["id"];
          }else if(subnets[i]["properties"]["applicationGatewayIPConfigurations"] != undefined){
            gateway["category"] = "Application Gateway";
            gateway["source"] = "/static/PNG/Azure Application Gateway_COLOR.png";
            gateway["id"] = subnets[i]["properties"]["applicationGatewayIPConfigurations"]["id"];
          }
          nodeData.push(gateway);
        }
      }
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
        connecto = data[j]["connection string"][key]["value"];
        if(connecto != undefined){
          if(connecto.slice(0,4) == "Serv"){
            connecto = connecto.split(',')[0].split(':')[1];
          }else if(connecto.slice(0,4) == "jdbc"){
            connecto = connecto.split(':')[2].split('/')[-1];
          }else if(connecto.slice(0,4) == "Driv"){
            connecto = connecto.split(';')[1].split(':')[1].split(',')[0];
          }else{
            //undefined...
          }
          conInfo = { "value":connecto, "key": String(j)};
          connecting.push(conInfo);
        }
      }
      if(data[j]["virtualNetworkConnection"].length > 0){
        for(var i=0; i<nodeData.length; i++){
          if(nodeData[i]["id"] == data[j]["virtualNetworkConnection"][0]["id"]){
            nodeLink.push({"from": nodeData[i]["key"], "to": j});
            break;
          }
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
      "subnet" : {readOnly: true, show: Inspector.showIfNode }, 
      "subnet address prefixes": {readOnly: true, show: Inspector.showIfNode }, 
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
        myDiagram.model.nodeDataArray[data["num"]]["error"] = data["item"]["judge"];
        doneCount++;
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
              "subnet" : {readOnly: true, show: Inspector.showIfNode }, 
              "subnet address prefixes": {readOnly: true, show: Inspector.showIfNode }, 
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