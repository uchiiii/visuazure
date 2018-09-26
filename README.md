visuazure
====

This web application enables azure users to visualize the connections among resources. 

## Description
In the Azure portal, it is sometimes troublesome to understand how each resource connect to others in Microsoft Azure.
By using this app, you can get a straightforward view of your resource group like below. The data used is fetched from Azure management. For the front end, GoJs, which is a Javascript framework, is used to visualize it.

## DEMO
![example](https://github.com/uchiiii/visuazure/tree/master/static/PNG/example.PNG)     
In this case, you can easily understand webapp is deployed from Github and has some data connection with two SQL databases. Moreover, the subnets and gateways are also visualized. 

## Requirement
- Python 3.x.x
    - flask
    - adal

## Future Improvement
This app is under development. Following features should be added. ANY pull requests are welcome.
- UI improvement 
    - Home page
    - How to Use page
- Processing speed 
- Resources that can be displayed    
Current supported resource are VM, Vnet, Webapps, SQL database, Load balancer, and Storage.
- Detail change on each resource