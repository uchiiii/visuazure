// Resource class
var Resource = function(name, type, location, photoName){
    this.name = name;
    this.location = location;
    this.type = type;
    this.photoName = photoName;
    this.group = [];
    this.connectedNode = [];

    /*
    this.getType = function(){
        return this.type;
    }

    this.getName = function(){
        return this.name;
    }
    this.getLocation = function(){
        return this.location;
    }

    this.putImageString = function(){
        imageString = 'PNG/' + this.photoName;
    }
    */
    this.addConnectedNode = function(connectedNode){
        this.connectedNode.push(connectedNode);
    }

    this.addGroup = function(group){
        this.group.push(group);
    }
}

Resource.prototype.createObject = function(jsonInfo){
    for(var i=0; i < jsonInfo["value"].length; i++){
        //インスタンスの名前を自動生成してくれる方法はないのか。もしくはほとんど同じなら、中で宣言してしまえる
    } 
}

var Storage = function(name, location){
    Resource.call(this, name, "Storage", location, "Storage.png");
}


var WebApps = function(name, location){
    Resource.call(this, name, "Azure App Service", location, "PNG/Azure App Service.png");
}

var SQLDatabase = function(name, location){
    Resource.call(this, name, "Azure SQL Database", location, "PNG/Azure SQL Database.png");
}

var VM = function(name, location){
    Resource.call(this, name, "Azure Virtual Machine" ,location, "PNG/Azure Virtual Machine 2_COLOR.png");
}

var VirtualNetwork = function(name, location){
    Resource.call(this, name, "Azure Virtual Network", location, "PNG/Azure Virtual Network.png");
}

var createStorageInstance = function(json){
    for(var i=0; i < json["value"].length; i++){
        eval("var storage" + i + "=" + i + ";" );
        
    }
}

function getStorageName(storageInfo){
    var storageName = [];
    for(var i = 0; i<storageInfo["value"].length; i++){
        storageName.push(storageInfo["value"][i]["name"]);
    }
    return storageName
}

