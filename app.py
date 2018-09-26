#Main Server.
#reference: "https://github.com/Azure-Samples/active-directory-python-webapp-graphapi"

#coding: utf-8
import adal
import flask
import uuid
import requests
import config
import json
import datetime

#Here is the functions that fetch the resrouce data 
def virtual_machine(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Compute/virtualMachines?api-version=2018-06-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources['value']:
        item["image"] = "/static/PNG/Azure Virtual Machine 2_COLOR.png"
        item["category"] = "Virtual Machine"
    return resources

def load_balancer(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Network/loadBalancers?api-version=2018-07-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources["value"]:
        item["image"] = "/static/PNG/Azure Load Balancer (feature).png"
        item["category"] = "Load Balancer"
    return resources

def virtual_network(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Network/virtualNetworks?api-version=2018-07-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources["value"]:
        item["image"] = "/static/PNG/Azure Virtual Network.png"
        item["category"] = "Virtual Network"
    return resources

def storage(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Storage/storageAccounts?api-version=2017-10-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources["value"]:
        item["image"] = "/static/PNG/Azure Storage.png"
        item["category"] = "Storage"
    return resources

def sql_server(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Sql/servers?api-version=2015-05-01-preview'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    return resources

def sql_database(sub_id, resource_group):
    server = sql_server(sub_id, resource_group)
    resources = {"value":[]}
    for it in server["value"]:
        endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Sql/servers/'+ it["name"] + '/databases?api-version=2017-10-01-preview'
        http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                        'User-Agent': 'adal-python-sample',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'client-request-id': str(uuid.uuid4())}
        data = requests.get(endpoint, headers=http_headers, stream=False).json()
        for item in data["value"]:
            item["server"] = it
            item["image"] = "/static/PNG/Azure SQL Database.png"
            item["category"] = "SQL Database"
        resources["value"].extend(data["value"])
    return resources

def redis(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Sql/servers?api-version=2015-05-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources["value"]:
        item["image"] = "/static/PNG/Azure Cache Redis Product icon_COLOR.png"
        item["category"] = "Redis"
    return resources

def webapp(sub_id, resource_group):
    endpoint = config.RESOURCE + sub_id + '/resourceGroups/' + resource_group + '/providers/Microsoft.Web/sites?api-version=2018-02-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    resources = requests.get(endpoint, headers=http_headers, stream=False).json()
    for item in resources["value"]:
        item["image"] = "/static/PNG/Azure App Service - Web App_COLOR.png"
        item["category"] = "WebApps"
        #auth for other apps
        endpoint = "https://management.azure.com" + item["id"] + "/config/authsettings/list?api-version=2018-02-01"
        authdata = requests.post(endpoint, headers=http_headers, stream=False).json()
        item["appauth"] = []
        if authdata["properties"]["googleClientId"] != None:
            item["appauth"].append("google")
        if authdata["properties"]["facebookAppId"] != None:
            item["appauth"].append("facebook")
        if authdata["properties"]["twitterConsumerKey"] != None:
            item["appauth"].append("twitter")
        #connection string
        endpoint = "https://management.azure.com" + item["id"] + "/config/connectionstrings/list?api-version=2018-02-01"
        constr = requests.post(endpoint, headers=http_headers, stream=False).json()
        item["connection string"] = constr["properties"]
        #deployment
        endpoint = "https://management.azure.com" + item["id"] + "/deployments?api-version=2018-02-01"
        deploy = requests.get(endpoint, headers=http_headers, stream=False).json()
        item["deployment"] = deploy["value"]
        #virtual Network connetction
        endpoint = "https://management.azure.com" + item["id"] + "/virtualNetworkConnections?api-version=2018-02-01"
        vnetcon =  requests.get(endpoint, headers=http_headers, stream=False).json()
        item["virtualNetworkConnection"] = vnetcon
    return resources

#The below is the process of the application.
app = flask.Flask(__name__)
app.debug = True
app.secret_key = 'development'

PORT = 5000  # A flask app by default runs on PORT 5000
AUTHORITY_URL = config.AUTHORITY_HOST_URL + '/' + config.TENANT
REDIRECT_URI = 'http://localhost:{}/getAToken'.format(PORT)
TEMPLATE_AUTHZ_URL = ('https://login.microsoftonline.com/{}/oauth2/authorize?' +
                      'response_type=code&client_id={}&redirect_uri={}&' +
                      'state={}&resource={}')


@app.route("/")
def main():
    login_url = 'http://localhost:{}/login'.format(PORT)
    resp = flask.Response(status=307)
    resp.headers['location'] = login_url
    return resp


@app.route("/login")
def login():
    auth_state = str(uuid.uuid4())
    flask.session['state'] = auth_state
    authorization_url = TEMPLATE_AUTHZ_URL.format(
        config.TENANT,
        config.CLIENT_ID,
        REDIRECT_URI,
        auth_state,
        config.RESOURCE)
    resp = flask.Response(status=307)
    resp.headers['location'] = authorization_url
    return resp

#is NOT used
@app.route("/getTenant")
def getTenantID(sub_id):
    sub_id = '2446573a-d2e9-4fda-ae3e-f82a58b0da04'
    url = 'https://management.azure.com/subscriptions/{}?api-version=2015-01-01'.format(sub_id)
    r = requests.get(url)
    tenantID = r.headers['WWW-Authenticate'].split(',')[0].split('=')[1][-37:-1]
    return tenantID

@app.route("/getAToken")
def main_logic():
    code = flask.request.args['code']
    state = flask.request.args['state']
    if state != flask.session['state']:
        raise ValueError("State does not match")
    auth_context = adal.AuthenticationContext(AUTHORITY_URL)
    token_response = auth_context.acquire_token_with_authorization_code(code, REDIRECT_URI, config.RESOURCE,
                                                                        config.CLIENT_ID, config.CLIENT_SECRET)
    # It is recommended to save this to a database when using a production app.
    flask.session['access_token'] = token_response['accessToken']
    return flask.redirect('/home')


@app.route('/home')
def home():
    subscriptions = []
    if 'access_token' not in flask.session:
        return flask.redirect(flask.url_for('login'))
    #for subscription info
    endpoint = config.RESOURCE + 'subscriptions?api-version=2014-04-01'
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    data = requests.get(endpoint, headers=http_headers, stream=False).json()
    #for resource info
    for i in range(len(data["value"])):
        data["value"][i].pop("subscriptionPolicies")
        subscriptions.append(data["value"][i]["displayName"])
        endpoint2resource = config.RESOURCE + 'subscriptions/' + data["value"][i]["subscriptionId"]  +  '/resourceGroups?api-version=2014-04-01'
        http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                        'User-Agent': 'adal-python-sample',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'client-request-id': str(uuid.uuid4())}
        data_res = requests.get(endpoint2resource, headers=http_headers, stream=False).json()
        data["value"][i]["resourceGroup"] = data_res["value"]
            
    flask.session["data"] = data
    return flask.render_template('home.html', data=data)

@app.route('/subscriptions/<subscription_id>')
def show_resource_gropus(subscription_id):
    if 'access_token' not in flask.session:
        return flask.redirect(flask.url_for('login'))
    resource_groups = []
    return flask.render_template('resources_under_subscription.html', resource_groups=resource_groups)

@app.route('/subscriptions/<subscription_id>/<resource_name>')
def show_graph(subscription_id, resource_name):
    if 'access_token' not in flask.session:
        return flask.redirect(flask.url_for('login'))
    data = flask.session.get('data')
    sub = {}
    for item in data["value"]:
        if item["subscriptionId"] == subscription_id:
            for item2 in item["resourceGroup"]:
                if item2["name"] == resource_name:
                    item2["displayName"] = item["displayName"]
                    item2["subscriptionId"] = item["subscriptionId"]
                    sub["value"] = item2
    return flask.render_template('main.html', data=data, sub=sub)

#This is not used 
@app.route('/get_resource', methods=['POST'])
def return_resource_json():
    #fitch data from azure management
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']

    data = []
    data.extend(virtual_machine(sub_id, resource_group_name)["value"])
    data.extend(load_balancer(sub_id, resource_group_name)["value"])
    data.extend(virtual_network(sub_id, resource_group_name)["value"])
    data.extend(storage(sub_id, resource_group_name)["value"])
    data.extend(sql_database(sub_id, resource_group_name)["value"])
    data.extend(webapp(sub_id, resource_group_name)["value"])

    #for debug
    return flask.jsonify(resource_data=data)

@app.route('/get_virtual_machine', methods=['POST'])
def return_vm():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    return flask.jsonify(item=virtual_machine(sub_id, resource_group_name))

@app.route('/get_load_balancer', methods=['POST'])
def return_lb():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    return flask.jsonify(item=load_balancer(sub_id, resource_group_name))

@app.route('/get_virtual_network', methods=['POST'])
def return_vn():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    return flask.jsonify(item=virtual_network(sub_id, resource_group_name))

@app.route('/get_storage', methods=['POST'])
def return_storage():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    return flask.jsonify(item=storage(sub_id, resource_group_name))

@app.route('/get_sql_database', methods=['POST'])
def return_sql():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    item = sql_database(sub_id, resource_group_name)
    return flask.jsonify(item=item)

@app.route('/get_webapps', methods=['POST'])
def return_webapp():
    fetched = flask.request.get_json()
    sub_id = 'subscriptions/' +fetched['subscription']
    resource_group_name = fetched['resource_name']
    return flask.jsonify(item=webapp(sub_id, resource_group_name))

@app.route('/get_error', methods=['POST'])
def return_error():
    fetched = flask.request.get_json()
    category = fetched['category']
    resource_id = fetched['id']
    if 'access_token' not in flask.session:
        return flask.redirect(flask.url_for('login'))
    http_headers = {'Authorization': 'Bearer ' + flask.session.get('access_token'),
                    'User-Agent': 'adal-python-sample',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'client-request-id': str(uuid.uuid4())}
    end_time = datetime.datetime.utcnow()
    start_time = end_time - datetime.timedelta(hours=24)
    timespan = start_time.isoformat()[:19] + 'Z/' + end_time.isoformat()[:19] + 'Z'
    if(category == "WebApps"):
        #get the number of error for the last 1 hour.
        metricname = 'Http5xx'
        aggregation = 'Count'
        interval = 'PT1H'
        endpoint = 'https://management.azure.com/' +  resource_id + '/providers/microsoft.insights/metrics?timespan=' + timespan + '&metricnames=' + metricname + '&aggregation=' + aggregation + '&interval=' + interval + '&api-version=2018-01-01'
        data = requests.get(endpoint, headers=http_headers, stream=False).json()
        point_data = data['value'][0]['timeseries'][0]['data'][-1]['count']
        if(point_data == 0):
            judge = { "judge" : False}
        else:
            judge = { "judge" : True }
        return flask.jsonify(item=judge, num=fetched['num'])
    elif(category == "SQL Database"):
        #get the number of error for the last 1 hour.
        errors = {}
        metricname = 'connection_failed'
        aggregation = 'Count'
        interval = 'PT1H'
        endpoint = 'https://management.azure.com/' +  resource_id + '/providers/microsoft.insights/metrics?timespan=' + timespan + '&metricnames=' + metricname + '&aggregation=' + aggregation + '&interval=' + interval + '&api-version=2018-01-01'
        data = requests.get(endpoint, headers=http_headers, stream=False).json()
        errors[metricname] = data['value'][0]['timeseries'][0]['data'][-1]['count']
        sec_metricname = 'blocked_by_firewall'
        sec_endpoint = 'https://management.azure.com/' +  resource_id + '/providers/microsoft.insights/metrics?timespan=' + timespan + '&metricnames=' + sec_metricname + '&aggregation=' + aggregation + '&interval=' + interval + '&api-version=2018-01-01'
        sec_data = requests.get(sec_endpoint, headers=http_headers, stream=False).json()
        errors[sec_metricname] = sec_data['value'][0]['timeseries'][0]['data'][-1]['count']
        third_metricname = 'deadlock'
        third_endpoint = 'https://management.azure.com/' +  resource_id + '/providers/microsoft.insights/metrics?timespan=' + timespan + '&metricnames=' + third_metricname + '&aggregation=' + aggregation + '&interval=' + interval + '&api-version=2018-01-01'
        third_data = requests.get(third_endpoint, headers=http_headers, stream=False).json()
        errors[third_metricname] = third_data['value'][0]['timeseries'][0]['data'][-1]['count']
        sum_error = 0
        for v in errors.values():
            sum_error += v
        if(sum_error == 0):
            judge = { "judge" : False}
        else:
            judge = { "judge" : True }
        return flask.jsonify(item=judge, num=fetched['num'])

@app.route('/usage')
def show_usage():
    return flask.render_template('usage.html')

@app.route('/confirm_logout')
def confirm():
    return flask.render_template('confirm_logout.html')

@app.route('/logout')
def logout():
    return 0

@app.route('/user_info')
def get_user_info():
    return flask.render_template('user.html')


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)

