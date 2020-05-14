# Last GoodReads

Q&D script to retrieve the five last four starts or more rated books on a [goodreads.com](https://www.goodreads.com/) user profile.

Store the data in a local JSON.

## Setup

### Dependencies

```bash
npm install
```

### Variables 

#### grProfileId

Update it with the user's _ID_ (USER_ID) for whom to retrieve the data.

The user profile URL looks like this : `https://www.goodreads.com/user/show/USER_ID-USERNAME`

#### devMode

When set to true, it will work on a local cache to avoid making too many queries to goodreads.com. 

The first time the script is ran in dev mode, it will make an actual HTTP call to retrieve the data and save them in the local cache. Then it will only use the local cache.

## Run

```bash
npm start
```
