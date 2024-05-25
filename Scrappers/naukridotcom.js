import puppeteer from 'puppeteer';

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto('https://www.naukri.com/jobs-in-india?clusters=functionalAreaGid%2Cstipend&functionAreaIdGid=5&jobAge=1', {
        waitUntil: 'networkidle2',
    });

    // Wait for the first set of job listings to load
    await page.waitForSelector('.styles_jlc__main__VdwtF');

    // Scrape job data from the first selector
    const jobsFromFirstSelector = await page.evaluate(() => {
        const jobNodes = document.querySelectorAll('.srp-jobtuple-wrapper');

        const jobs = [];
        jobNodes.forEach(job => {
            const title = job.querySelector('.row1')?.innerText || 'N/A';
            const company = job.querySelector('.client-company-name')?.innerText || 'N/A';
            const location = job.querySelector('.loc-wrap.ver-line')?.innerText || 'N/A';
            const experience = job.querySelector('.exp-wrap')?.innerText || 'N/A';
            const salary = job.querySelector('.sal-wrap.ver-line')?.innerText || 'N/A';
            const postedDate = job.querySelector('.job-post-day')?.innerText || 'N/A';
            const applyLink = job.querySelector('.title a')?.href || 'N/A';

            jobs.push({
                mainData: { company, title, location },
                additionalData: { applyLink, experience, salary, postedDate }
            });
        });

        return jobs;
    });

    // Scrape job data from the second selector within the same page
    const jobsFromSecondSelector = await page.evaluate(() => {
        const jobNodes = document.querySelectorAll('.s2j__tupple-container'); // Replace with actual second selector

        const jobs = [];
        jobNodes.forEach(job => {
            const title = job.querySelector('.row1')?.innerText || 'N/A';
            const company = job.querySelector('.comp-name.mw-25')?.innerText || 'N/A';
            const location = job.querySelector('.loc-wrap.ver-line')?.innerText || 'N/A';
            const experience = job.querySelector('.exp-wrap')?.innerText || 'N/A';
            const salary = job.querySelector('.sal-wrap.ver-line')?.innerText || 'N/A';
            const postedDate = job.querySelector('.job-post-day')?.innerText || 'N/A';
            const applyLink = job.querySelector('.s2j__tupple-container a')?.href || 'N/A';

            jobs.push({
                mainData: { company, title, location },
                additionalData: { applyLink, experience, salary, postedDate }
            });
        });

        return jobs;
    });

    // Merge the two sets of job data
    const allJobs = [...jobsFromFirstSelector, ...jobsFromSecondSelector];

    // Print the job data
    allJobs.forEach((job, index) => {
        console.log("Main Data:");
        console.log(job.mainData);
        console.log("Additional Data:");
        console.log(job.additionalData);
        console.log('---------------------------');
    });

    await browser.close();
})();
