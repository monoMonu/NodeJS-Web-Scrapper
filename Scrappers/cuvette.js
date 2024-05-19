import { Builder, By, until, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const prefs = new logging.Preferences();
prefs.setLevel(logging.Type.BROWSER, logging.Level.OFF);

const options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--disable-gpu');
options.setLoggingPrefs({ browser: 'OFF' });

const driver = await new Builder()
   .forBrowser('chrome')
   .setChromeOptions(options)
   .build();


const type = {
   'internships': {
      containerClass: 'StudentInternshipCard_innerContainer__3shqY',
      headingClass: 'StudentInternshipCard_heading__1JfH4',
      keyClass: 'StudentInternshipCard_infoTop__3yl8o',
      valueClass: 'StudentInternshipCard_infoValue__E3Alf',
      postTimeClass: 'StudentInternshipCard_currentInfoLeft__1jLNL',
      shareBtnCSS: '.StudentInternshipCard_shareBtn__fR5A0.icon-on-hover',
      cancelBtnCSS: '.Button_button__2Lf63.Share_cancelButton__35Ggc',
      textareaCSS: '.custom-scroll.basic-input',
   },
   'fulltimeJobs': {
      containerClass: 'StudentJobCard_innerContainer__1HYXP',
      headingClass: 'StudentJobCard_heading__3eoXb',
      keyClass: 'StudentJobCard_infoTop__2HBCx',
      valueClass: 'StudentJobCard_infoValue__pLPuG',
      postTimeClass: 'StudentJobCard_currentInfoLeft___NbOf',
      shareBtnCSS: '.StudentJobCard_shareBtn__bkNrl.icon-on-hover',
      cancelBtnCSS: '.Button_button__2Lf63.Share_cancelButton__35Ggc',
      textareaCSS: '.custom-scroll.basic-input',
   }
}

async function scrapeWebsite() {

   try {
      await driver.get('https://cuvette.tech/app/student/login');

      // Log in 
      // Wait for the username field to be located
      const usernameField = await driver.wait(until.elementLocated(By.css('.basic-input.LoginWithEmail_darkBorder__3htqi')), 10000);
      await driver.wait(until.elementIsVisible(usernameField), 10000);
      await usernameField.sendKeys('nogofa@cyclelove.cc');

      // Wait for the password field to be located
      const passwordField = await driver.wait(until.elementLocated(By.css('.PasswordInput_formPasswordInput__1A7J_.PasswordInput_darkBorder__1tlYC>input')), 10000);
      await driver.wait(until.elementIsVisible(passwordField), 10000);
      await passwordField.sendKeys('cosmo@cuvette');

      const submitButton = await driver.wait(until.elementLocated(By.css('.Button_button__2Lf63.LoginWithEmail_login__T6YaR')), 10000);
      await driver.wait(until.elementIsVisible(submitButton), 10000);
      await submitButton.click();
      
      // This is to make sure that the page has loaded completely after logging in 
      await driver.wait(until.elementLocated(By.css('.DashboardPanel_navigation__10Cmg')), 10000);

      const fulltimeJobs = await scrape('fulltimeJobs');
      const internships = await scrape('internships');

      console.log(data);

   }
   catch(error){
      console.log(`Error while navigating to the page to be scrapped. \n Error: ${error}`)
   }
   finally {
      await driver.quit();
   }
}

const data = [];

async function scrape(t){

   try {

      // The page to be scrapped
      await driver.get(`https://cuvette.tech/app/student/jobs/${t}/filters?sortByDate=true`);
      await driver.wait(until.elementLocated(By.css(`.${type[t].valueClass}`)), 10000);
      
      await driver.wait(until.elementLocated(By.css(`.${type[t].containerClass}`)), 10000);

      const containers = await driver.findElements(By.className(type[t].containerClass));
      
      // Iterate over the elements and extract their content
      for (let i=0; i < containers.length; i++) {

         // Ensuring data has loaded
         const obj = {};

         // Filtering out last 12hrs postings
         const postTimeString = await containers[i].findElement(By.css(`.${type[t].postTimeClass}>p`)).getText();
         let postedString = postTimeString.split(' ');
         postedString = postedString[postedString.length-2];
         let posted = parseInt(postedString);


         if ((postedString.search('h') ===-1 || posted >= 12) && postedString.search('m') ===-1) break;
   
         obj['Title'] = await containers[i].findElement(By.css(`.${type[t].headingClass} h3`)).getText();
   
         let locNcomp = await containers[i].findElement(By.css(`.${type[t].headingClass} p`)).getText();
         locNcomp = locNcomp.split('|');
   
         obj['Company'] = locNcomp[0];
         obj['Location'] = locNcomp[1];
   
         let keys = await containers[i].findElements(By.className(type[t].keyClass));
         let values = await containers[i].findElements(By.className(type[t].valueClass));
   
         for(let j=0; j < keys.length; j++){
            const key =  await keys[j].getText();
            if(key === 'Office Location') continue;
            obj[key] = await values[j].getText();
         }
         
         const shareBtn = await driver.wait(until.elementLocated(By.css(type[t].shareBtnCSS), 10000));
         await driver.executeScript("arguments[0].click();", shareBtn);
         const textarea = await driver.wait(until.elementLocated(By.css(type[t].textareaCSS)));
         let value = await textarea.getAttribute('value');
         const applyLink = value.split('Link:')[1];
         const cancelBtn = await driver.wait(until.elementLocated(By.css(type[t].cancelBtnCSS)), 10000);
         await driver.executeScript("arguments[0].click();", cancelBtn);

         obj['Apply here'] = applyLink;

         data.push(obj);
         
      }
   } catch (error) {
      console.log(`Error while scrapping data. \nError: ${error}`)
   }

   return data;
}

scrapeWebsite();
