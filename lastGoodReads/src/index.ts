import needle from 'needle';
import fs from 'fs';

// ************
// Variables
// ************
// User Profile ID on GoodReads : REPLACE WITH YOUR OWN
const grProfileId = '71854791';
// In devMode, work on a cache file instead of making HTTP requests
const devMode = false;

// URL to the GoodReads RSS feed : TO REPLACE
const grFeedURL = 'https://www.goodreads.com/review/list_rss/' + grProfileId + '?shelf=read';
// Where to store the result
const pathToOutputJson = './result.json';
// Where to store the cache
const pathToDevCache = './rss.json';


// ************
// Book class
// ************
class Book {
    title: string;
    author: string;
    thumbnail: string;
}

// ************
// Functions
// ************

/**
 * Check cache and initialize it if needed
 * @returns Promise<any> : Empty Promise (sad)
 */
function checkCache(): Promise<any> {
    if (devMode) {
        console.info('DEV MODE : ON');
        if (!fs.existsSync(pathToDevCache)) {
            console.info('No cache');
            return getPayload(!devMode)
                .then((pl) => savePayload(pathToDevCache, pl))
                .then(() => console.info('Cache saved'));
        } else {
            console.info('Cache OK');
        }
    } else {
        console.info('PROD MODE : ON');

    }
    return new Promise((res) => res(void 0));
}

/**
 * Get the RSS payload 
 * @param local : Retrieve the data from the local cache or making HTTP call to GoodReads ?
 * @returns Promise<any> : Promise with the JSON payload
 */
function getPayload(local: boolean = false): Promise<any> {
    console.info('Getting ' + (local ? 'local' : 'distant') + ' payload');
    return local ? fs.promises.readFile(pathToDevCache, 'utf8').then((d) => JSON.parse(d)) : needle('get', grFeedURL).then((d) => d.body);
}

/**
 * Saving payload in local file
 * @param path : Path to local file in which saving the payload
 * @param payload : Payload to save
 * @returns Promise<any> : Promise with the result of the writing process
 */
function savePayload(path: string, payload: any): Promise<any> {
    console.info('Saving payload in', path);
    return fs.promises.writeFile(path, JSON.stringify(payload));
}


// ************
// Main code
// ************
checkCache()
    .then(() => getPayload(devMode))
    .then((pl) => {

        let output = {
            items: Array<Book>()
        };

        console.info('Parsing the data');

        // Retrieve the first five books with a rating >= 4 stars
        pl.children[0].children.filter((c: any) => c.name === 'item' && parseInt(c.children.find((c: any) => c.name === 'user_rating').value) >= 4).slice(0, 5).forEach((b: any) => {
            let book: Book = new Book();
            book.title = b.children.find((c: any) => c.name === 'title').value;
            book.author = b.children.find((c: any) => c.name === 'author_name').value;
            book.thumbnail = b.children.find((c: any) => c.name === 'book_large_image_url').value;
            output.items.push(book);
        });

        console.info('Parsing done with ' + output.items.length + ' items found');

        return output;
    })
    .then((o) => savePayload(pathToOutputJson, o))
    .then(() => console.info('Result saved'))
    .finally(() => console.info('Ending'));