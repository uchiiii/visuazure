//authentification system
function getSubscriptionInfo(){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com/subscriptions?api-version=2014-04-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const subscriptionInfo = JSON.parse(event.target.responseText);
        return subscriptionInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getResourceGroupInfo(subscriptionId){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com/' + subscriptionId +  'resourceGroups?api-version=2014-04-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const subscriptionInfo = JSON.parse(event.target.responseText);
        return subscriptionInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getResourcesInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com/' + resourceGroup["id"] +  '/providers/Microsoft.Resources/deployments?api-version=2017-05-10';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const info = JSON.parse(event.target.responseText);
        return info;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

//storage info
function getStorageInfo(resourceGroup){ //id of the resourceg group matters
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Storage/storageAccounts?api-version=2017-10-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const storageInfo = JSON.parse(event.target.responseText);
        return storageInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getWebAppsInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Web/Sites?api-version=2018-02-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
        }
        const webAppsInfo = JSON.parse(event.target.responseText);
        return webAppsInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getVMInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Compute/virtualMachines?api-version=2018-06-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
        }
        const vmInfo = JSON.parse(event.target.responseText);
        return vmInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getSearchInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Search/searchServices?api-version=2015-08-19';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
        }
        const info = JSON.parse(event.target.responseText);
        return info;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getSQLServerInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Sql/servers?api-version=2015-05-01-preview';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
        }
        const sqlServerInfo = JSON.parse(event.target.responseText);
        return sqlServerInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getSQLInfo(resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com' + resourceGroup["id"] + '/providers/Microsoft.Compute/virtualMachines?api-version=2018-06-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
        }
        const sqlInfo = JSON.parse(event.target.responseText);
        return sqlInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getWebAppsConnectionInfo(resourceGroup, webAppName){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com';
    url += subscriptionId;
    url += resourceGroup;
    url += '/providers/Microsoft.Web/Sites';
    url += webAppName;
    url += 'config/connectionstrings/list?api-version=2018-02-01';
    request.open("POST", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const webAppsConnectionInfo = JSON.parse(event.target.responseText);
        return webAppsConnectionInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getVMInfo(){

}

function getSQLInfo(){

}

//array for subscription 
subscription = [];

//array for resource group
ResourceGroup = [];

//array for resources 
resources = [];


function createSubscriptionArray(){
    jsonInfo = getSubscriptionInfo();
    for(var i=0; i<jsonInfo["value"].length; i++){
        subscription.push(jsonInfo["value"][i]);
    }
    return subscription;
}

//get info of all resource groups 
function createResourceGroupArray(subscription){
    for(var i=0; i<subscription.length; i++){ //at each subscription
        jsonInfo = getResourceGroupInfo(subscription[i]["id"]);
        subscription[i]['resourceGroup'] = [];
        for(var j=0; j<jsonInfo["value"].length; j++){
            subscription[i]['resourceGroup'][j] = jsonInfo["value"][j]; 
        }
    }
    return subscription;
}

//existing service names arrays
services = ['Web Apps', ]

//get resources of ONE resource resource
function createResources(resourceGroup){
    resourceGroup["resources"] = [];
    jsonInfo = getResourcesInfo(resourceGroup["id"]);
    for(var i=0; i<jsonInfo["value"].length; i++){
        resourceGroup["resources"][i] += jsonInfo["value"][i];
    }
}

function getImageNameAndKey(resources){
    for(var i=0; i<resources.length; i++){
        switch(resources[i]["properties"]["providers"]["resourceTypes"]["resourceType"][0]){
            case 'searchServices':
                resources[i]["image"] = "PNG/Azure Search_COLOR.png";
                break;
            case 'virtualMachines':
                resources[i]["image"] = "PNG/Azure Virtual Machine 2_COLOR.png";
                break;
            case 'sites':
                resources[i]['image'] = "PNG/Azure App Service - Web App_COLOR.png";
                break;
            case 'servers/databases':
                resources[i]['image'] = "PNG/Azure SQL Database.png";
                break;
            case 'servers':
                resources[i]['image'] = "PNG/nothing.png";
                break;
            case 'Redis':
                resources[i]['image'] = "PNG/Azure Cache including Redis.png";
                break;
            case 'profiles/endpoints':
                resources[i]['image'] = "PNG/Service Endpoint.png";
                break;
            case 'profiles':
                resources[i]['image'] = "PNG/nothing.png";
                break;
            case 'storageAccounts':
                resources[i]['image'] = "PNG/Azure Storage.png";
                //you can categorize by blob,file...
                break;
            default:
                resources[i]['image'] = "PNG/nothing.png";
        }
        resources[i]['key'] = i;
    }
}

function generateNodeDataArray(resources){
    nodeDataArray = [];
    for(var i=0; i<resources.length; i++){
        nodeDataArray[i] = { "key": i, "name": resources[i]["name"], "source": resources[i]['image'] } //add group info
    }
    return nodeDataArray;
}

function generateLinkDataArray(){
    
}

function addConnectedNode(resources){

}

function addGroup(resources){

}


