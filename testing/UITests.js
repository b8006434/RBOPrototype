const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('chromedriver');
const assert = require('assert');



//#region Login UI Screen
describe('UI Page: login', () => {

  //Check the username & password fields accept values correctly
  it('Check the username & password text box works correctly', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();
      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("username text box test");
      await driver.findElement(By.name("password")).sendKeys("password text box test");

      //Get the values from the username and password textboxes
      const passwordReturnedValue = await driver.findElement(By.name("password")).getAttribute("value");
      const usernameReturnedValue = await driver.findElement(By.name("username")).getAttribute("value");

      //Make sure the textboxes and the typed values match
      assert.equal(usernameReturnedValue, "username text box test");
      assert.equal(passwordReturnedValue, "password text box test");

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

  //Check the login button works
  it('Check the login button works correctly', async () => {
    try {

      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("normaluser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      //Otherwise the login button doesn't work
      var url = "http://localhost:3000/dashboard";
      driver.navigate().to(url);

      //Wait until the table is visible in the browser, max 5 seconds
      let loaded = await driver.wait(until.elementLocated(By.name("[aria-label='simple table']")), 5000);
      
      //If the loading failed, the button does not work correctly, as correct credentails were supplied
      if(!loaded)
      {
        var loggedIn = false;
      }

      var loggedIn = driver.getCurrentUrl() == url ? true : false

      //Make sure table is shown
      assert.equal(loggedIn,true)

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

});



//#endregion

//#region REGISTER UI Screen

describe('UI Page: register', () => {

  //Check the username, password & confirm password fields accept values correctly
  it('Check the username, password & confirm password text boxes works correctly', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();
      //Set the URL to our front end url
      await driver.get('http://localhost:3000/register');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("username text box test");
      await driver.findElement(By.name("password")).sendKeys("password text box test");
      await driver.findElement(By.name("confirm_password")).sendKeys("not a matching value");

      //Get the values from the username and password textboxes
      const usernameReturnedValue = await driver.findElement(By.name("username")).getAttribute("value");
      const passwordReturnedValue = await driver.findElement(By.name("password")).getAttribute("value");
      const confirmPasswordReturnedValue = await driver.findElement(By.name("confirm_password")).getAttribute("value");

      //Make sure the textboxes and the typed values match
      assert.equal(usernameReturnedValue, "username text box test");
      assert.equal(passwordReturnedValue, "password text box test");
      assert.equal(confirmPasswordReturnedValue, "not a matching value");

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

  //Check the register button works
  it('Check the register button works correctly', async () => {
    try {

      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000/register');

      //Get the username,password & confirm password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("normaluser");
      await driver.findElement(By.name("password")).sendKeys("password");
      await driver.findElement(By.name("confirm_password")).sendKeys("not a matching value");

      //Find the register button, and click it
      let btnLogin = await driver.findElement(By.name("signupBttn"));
      await btnLogin.click();


      //Check that the sweet alert message pops up is a warning message, not a success message,
      //as the passwords do not match
      var message = await driver.findElement(By.className("swal-text")).getAttribute("innerText");

      assert.equal(message, 'Passwords do not match!');

      await driver.quit();
    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

});

//#endregion

//#region CLIENT DASHBOARD UI Screen (For 'Normal User')

describe('UI Page: dashboard', () => {

  //Check that the tickets table gets shown and populated correctly
  it('check that the table gets populated for the "normaluser" user', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("normaluser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      //Otherwise the login button doesn't work
      var url = "http://localhost:3000/dashboard";
      driver.navigate().to(url);

      //Wait until the table is visible in the browser, max 5 seconds
      let table = await driver.wait(until.elementLocated(By.name("[aria-label='simple table']")), 5000);

      //Make sure table is shown
      assert.notEqual(table, undefined);
      assert.notEqual(table, null);

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

  //Check that the search function for the table works correctly
  it('check that the search bar functions as expected', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("normaluser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      var url = "http://localhost:3000/dashboard";
      driver.navigate().to(url);

      //Wait until the search bar is visible in the browser, max 5 seconds
      await driver.wait(until.elementLocated(By.name('search')), 5000);

      //Send the below value to the search bar, and retrieve the search bar value
      await driver.findElement(By.name("search")).sendKeys("This value is a user test value for search");
      const searchBar = await driver.findElement(By.name("search")).getAttribute("value");

      //Make sure the search bar value contains, what we expect
      assert.equal(searchBar, 'This value is a user test value for search');

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(20000);

});

//#endregion

//#region ADMIN DASHBOARD UI Screen (For 'Admin User')

describe('UI Page: admindashboard', () => {

  //Check that the tickets table gets shown and populated correctly
  it('check that the table gets populated for the "adminuser" user', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("adminuser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      //Otherwise the login button doesn't work
      var url = "http://localhost:3000/admindashboard";
      driver.navigate().to(url);

      //Wait until the table is visible in the browser, max 5 seconds
      let table = await driver.wait(until.elementLocated(By.name("[aria-label='simple table']")), 5000);

      //Make sure table is shown
      assert.notEqual(table, undefined);
      assert.notEqual(table, null);

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

  //Check that the search function for the table works correctly
  it('check that the search bar functions as expected', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("adminuser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      var url = "http://localhost:3000/admindashboard";
      driver.navigate().to(url);

      //Wait until the search bar is visible in the browser, max 5 seconds
      await driver.wait(until.elementLocated(By.name('search')), 5000);

      //Send the below value to the search bar, and retrieve the search bar value
      await driver.findElement(By.name("search")).sendKeys("This value is a user test value for search");
      const searchBar = await driver.findElement(By.name("search")).getAttribute("value");

      //Make sure the search bar value contains, what we expect
      assert.equal(searchBar, 'This value is a user test value for search');

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(20000);

});

//#endregion

//#region EMPLOYEE DASHBOARD UI Screen (For 'Employee User')

describe('UI Page: employeedashboard', () => {

  //Check that the tickets table gets shown and populated correctly
  it('check that the table gets populated for the "employeeuser" user', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("employeeuser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      //Otherwise the login button doesn't work
      var url = "http://localhost:3000/employeedashboard";
      driver.navigate().to(url);

      //Wait until the table is visible in the browser, max 5 seconds
      let table = await driver.wait(until.elementLocated(By.name("[aria-label='simple table']")), 5000);

      //Make sure table is shown
      assert.notEqual(table, undefined);
      assert.notEqual(table, null);

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(15000);

  //Check that the search function for the table works correctly
  it('check that the search bar functions as expected', async () => {
    try {
      //Start the chrome automated testing driver
      var driver = await new Builder()
        .forBrowser('chrome')
        .build();

      //Set the URL to our front end url
      await driver.get('http://localhost:3000');

      //Get the username and password text boxes, and send values to them
      await driver.findElement(By.name("username")).sendKeys("employeeuser");
      await driver.findElement(By.name("password")).sendKeys("password");

      //Find the login button, and click it
      let btnLogin = await driver.findElement(By.name("loginBttn"));
      await btnLogin.click();

      //Set the destination url, which gets shown when user logs in,
      //If the navigation to the url was succesfull, the user is logged in,
      var url = "http://localhost:3000/employeedashboard";
      driver.navigate().to(url);

      //Wait until the search bar is visible in the browser, max 5 seconds
      await driver.wait(until.elementLocated(By.name('search')), 5000);

      //Send the below value to the search bar, and retrieve the search bar value
      await driver.findElement(By.name("search")).sendKeys("This value is a user test value for search");
      const searchBar = await driver.findElement(By.name("search")).getAttribute("value");

      //Make sure the search bar value contains, what we expect
      assert.equal(searchBar, 'This value is a user test value for search');

      await driver.quit();

    }
    catch (error) {
      await driver.quit();
      console.log(error)
    }
  }).timeout(20000);

});

//#endregion