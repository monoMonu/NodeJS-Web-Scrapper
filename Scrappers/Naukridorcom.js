import puppeteer from 'puppeteer';
import fs from 'fs';

// Define the JSON file path
const dataFilePath = './jobs.json';

// Function to load existing data from the JSON file
const loadData = () => {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        return JSON.parse(rawData);
    }
    return [];
};

// Function to save data to the JSON file
const saveData = (data) => {
    if(data.length==0) return;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Function to filter new data
const filterNewData = (data, savedData) => {
   if(savedData.length > 0){
      const newData = [];
      data.forEach(obj1 => {
         let isNew = true;
         for(let i=0; i<savedData.length; i++){
            if(JSON.stringify(obj1.mainData)==JSON.stringify(savedData[i].mainData)){
               isNew = false;
               break;
            };
         }
         if(isNew) newData.push(obj1);
      })
      return newData;
   }
   return data;
};

(async () => {
    try {
        // Launch the browser
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
    
        // Navigate to the website
        await page.goto('https://www.naukri.com/internship-jobs?src=discovery_trendingWdgt_homepage_srch&functionAreaIdGid=5&jobAge=1', {
            waitUntil: 'networkidle2',
        });
    
        // Wait for the first set of job listings to load
        await page.waitForSelector('.styles_jlc__main__VdwtF');
    
        // Scrape job data from the first selector
        const jobsFromFirstSelector = await page.evaluate(() => {
            const jobNodes = document.querySelectorAll('.srp-jobtuple-wrapper');
    
            const jobs = [];
            jobNodes.forEach(job => {
                const Title = job.querySelector('.title')?.innerText || 'N/A';
                const Company = job.querySelector('.comp-name')?.innerText || 'N/A';
                const Location = job.querySelector('.locWdth')?.innerText || 'N/A';
                const Stipend= job.querySelector('.sal-wrap.ver-line')?.innerText || 'N/A';
                const Date = job.querySelector('.job-post-day')?.innerText || 'N/A';
                const ApplyLink = job.querySelector('.title')?.href || 'N/A';
    
                jobs.push({
                    mainData: {  Title, Company, Location, ApplyLink},
                    additionalData: { Stipend, Date }
                });
            });
    
            return jobs;
        });
        
        const allJobs = [...jobsFromFirstSelector];
        
        let jobsData = [...jobsFromFirstSelector];
        
        const savedData = loadData();
        jobsData = filterNewData(jobsData, savedData);
        
        saveData(jobsData);
        
        // Print the filtered job data
        console.log(jobsData)
    
        await browser.close();
        
    } catch (error) {
        console.log("Error while scrapping...\nError: "+error);
        return;
    }
})();
