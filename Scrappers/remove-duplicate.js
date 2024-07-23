const fs = require('fs');


function removeDuplicates(data) {
    const seen = new Set();
    const uniqueData = [];

    data.forEach(entry => {
        const identifier = `${entry.Company}-${entry.Role}`;
        if (!seen.has(identifier)) {
            seen.add(identifier);
            uniqueData.push(entry);
        }
    });

    return uniqueData;
}

fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);

        const uniqueData = removeDuplicates(jsonData);  
        fs.writeFile('data.json', JSON.stringify(uniqueData, null, 4), (err) => {
            if (err) {
                console.error('Error writing the file:', err);
            } else {
                console.log('File successfully updated with unique data.');
            }
        });
    } catch (parseErr) {
        console.error('Error parsing the JSON data:', parseErr);
    }
});
