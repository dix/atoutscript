# cleanZwo.sh

Removing the `ftpOverride` property in all the `.zwo` files contained within a given directory and its subdirectories.

## Usage

`./cleanZwo.sh /path/to/workouts/directory`

## Explanations

To import custom workouts in Zwift, one needs to put a `.zwo` file [in their workouts directory](https://support.zwift.com/en_us/custom-workouts-ryGOTVEPs#Importing_Custom_Workouts_Today's_Plan_or_TrainingPeaks "Zwift Support").

On Xert, in order to provide custom workouts tailored as close as possible to the goals provided by the Advisor, the `.zwo` files exported from the platform contain a `ftpOverride` property which value is the current FTP on Xert and that tells Zwift to base the intervals on this FTP and not the FTP set on Zwift.

This approach allows Xert to provide their users with the most straightforward experience with both platforms.

But one can still want to manage their workout's target based on the FTP set on Zwift; to set it higher or lower than the one detected by Xert.

This script is here to automatically remove the `ftpOverride` in all `.zwo` files and achieve exactly this purpose.

## Note

This script is not affiliated in any way with both Xert and Zwift; it's just here to fulfill the needs of one of their happy users.