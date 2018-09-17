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

//storage info
function getStorageInfo(subscriptionId, resourceGroup){ //id of the resourceg group matters
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com';
    url += subscriptionId;
    url += resourceGroup;
    url += '/providers/Microsoft.Storage/storageAccounts?api-version=2017-10-01'
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

function getWebAppsInfo(subscriptionId, resourceGroup){
    const request = new XMLHttpRequest();
    url = 'https://management.azure.com';
    url += subscriptionId;
    url += resourceGroup;
    url += '/providers/Microsoft.Web/Sites?api-version=2018-02-01';
    request.open("GET", url);
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            console.log(`${event.target.status}: ${event.target.statusText}`);
            return;
        }
        const webAppsInfo = JSON.parse(event.target.responseText);
        return webAppsInfo;
    });
    request.addEventListener("error", () => {
        console.error("Network Error");
    });
    request.send();
}

function getWebAppsConnectionInfo(subscriptionId, resourceGroup, webAppName){
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