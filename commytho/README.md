# Commytho

Simple Node.js script to make fake commits and automatize it using GitHub Actions.

## How-to

### Simple launch

```bash
npm run start -- --git.email=alice@provider.tld --git.username=Alice --outputfile=file.ext
```

The script will make between 0 and 10 commits on the `file.ext` file for the user `Alice` & email `alice@provider.tld`.

### With GitHub Actions

First, create a new repository in which the Workflow will run.

Then, create a new Workflow using this template :

```yaml
name: Commytho

on:
  schedule:
    - cron: '15 9 * * *'
    - cron: '45 18 * * *'

jobs:
  build:
    name: Commytho V1.0
    runs-on: ubuntu-latest

    steps:
      # Checkout current project
      - name: Checkout Current Project
        uses: actions/checkout@v2
        with:
          persist-credentials: false
          fetch-depth: 0
      # Checkout Commytho in a subdir
      - name: Checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false
          fetch-depth: 0
          repository: dix/atoutscript
          path: ./atoutscript
      # Copy Commytho in working directory
      - name: Copy Commytho in working directory
        run: cp ./atoutscript/commytho/* .
      # Setup Node.js
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14.x
          cache: 'npm'
      # Install packages  
      - run:
          npm install
      # Launch Commytho
      - name: Launch !
        run: npm run start -- --git.email=alice@provider.tld --git.username=Alice --outputfile=file.ext
      # Push result
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
      # Done
      - name: End
        run: echo 'And... cut!'
```

This Workflow will run every day at 9h15 &
18h45 ([without guaranty](https://github.com/orgs/community/discussions/27130)). Making between 0 & 10 commits each time
with the same credentials as previously.