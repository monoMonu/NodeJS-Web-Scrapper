import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.naukri.com/jobs-in-india?clusters=functionalAreaGid%2Cstipend&functionAreaIdGid=5&jobAge=1', {
        waitUntil: 'networkidle2',
    });
    await page.waitForSelector('.styles_jlc__main__VdwtF');
    const jobsFromFirstSelector = await page.evaluate(() => {
        const jobNodes = document.querySelectorAll('.srp-jobtuple-wrapper');

        const jobs = [];
        jobNodes.forEach(job => {
            const Title = job.querySelector('.row1')?.innerText || 'N/A';
            const Company = job.querySelector('.client-company-name')?.innerText || 'N/A';
            const Location = job.querySelector('.loc-wrap.ver-line')?.innerText || 'N/A';
            const Experience = job.querySelector('.exp-wrap')?.innerText || 'N/A';
            const Salary = job.querySelector('.sal-wrap.ver-line')?.innerText || 'N/A';
            const PostedDate = job.querySelector('.job-post-day')?.innerText || 'N/A';
            const ApplyLink = job.querySelector('.title a')?.href || 'N/A';

            jobs.push({
                mainData: { Title, Company,  Location, ApplyLink},
                additionalData: {  Experience, Salary, PostedDate }
            });
        });

        return jobs;
    });
    const jobsFromSecondSelector = await page.evaluate(() => {
        const jobNodes = document.querySelectorAll('.s2j__tupple-container'); 

        const jobs = [];
        jobNodes.forEach(job => {
            const Title = job.querySelector('.row1')?.innerText || 'N/A';
            const Company = job.querySelector('.comp-name.mw-25')?.innerText || 'N/A';
            const Location = job.querySelector('.loc-wrap.ver-line')?.innerText || 'N/A';
            const Experience = job.querySelector('.exp-wrap')?.innerText || 'N/A';
            const Salary = job.querySelector('.sal-wrap.ver-line')?.innerText || 'N/A';
            const PostedDate = job.querySelector('.job-post-day')?.innerText || 'N/A';
            const ApplyLink = job.querySelector('.s2j__tupple-container a')?.href || 'N/A';

            jobs.push({
                mainData: { Title, Company, Location, ApplyLink },
                additionalData: { Experience, Salary, PostedDate }
            });
        });

        return jobs;
    });
    const allJobs = [...jobsFromFirstSelector, ...jobsFromSecondSelector];
    allJobs.forEach((job, index) => {
        console.log("Main Data:");
        console.log(job.mainData);
        console.log("Additional Data:");
        console.log(job.additionalData);
        console.log('---------------------------');
    });

    await browser.close();
})();
