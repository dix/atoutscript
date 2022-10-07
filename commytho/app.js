const {exec} = require('child_process');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

if (!(argv.git?.email && argv.git?.username && argv.outputfile)) {
    console.error('Missing parameters; please launch with :');
    console.error('app.js --git.email=x@y.z --git.username=abc --outputfile=def.ext');
    process.exit(42);
}

const numberCommits = Math.floor(Math.random() * 10);
console.log(`Number of commits for today : ${numberCommits}`);

// Let's go
next(0);

function next(id) {
    if (id < numberCommits) {
        console.log(`Making commit ${id}`);
        executeCmd(`echo '${Date.now()}' > ${argv.outputfile}`);
        executeCmd(`git config --local user.email "${argv.git.email}"`,
            () => executeCmd(`git config --local user.name "${argv.git.username}"`,
                () => executeCmd(`git add . && git commit -m 'commytho: blip blop' -a`,
                    () => next(id + 1)
                )
            )
        );
    } else {
        console.log('Done.');
    }
}

function executeCmd(cmd, callback) {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        if (callback) {
            callback();
        }
    });
}