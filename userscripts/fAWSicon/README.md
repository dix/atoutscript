# fAWSicon

Userscript matching the favicon with the service currently opened in the AWS Management Console.

![Tabs Example](./assets/tabs.png)

## Disclaimer

It is provided "as is", without warranty of any kind.

It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with [AWS](https://aws.amazon.com/).

## Inspiration

The script and its code are hugely inspired by Maddison Hellstrom's [AWS Favicons WebExtension](https://github.com/b0o/aws-favicons-webextension).

## About the code

The current version has been made during a lunch break as a Proof of Concept. It's not optimized in any way or broadly tested.

Even though a simple caching mechanism has been implemented for the `services.json` file; a better solution would be to dynamically retrieve all the services' settings and icons, like it's done by [b0o's update.sh](https://github.com/b0o/aws-favicons-webextension/blob/main/scripts/update.sh), and cache the result.