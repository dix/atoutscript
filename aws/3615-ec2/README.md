# 3615 ec2

Quickly connect to an EC2 instance in SSH by its name.

## Configuration

The connection is done with `ssh PRIVATE-IP`, so the target instance must use the current username and accept its default SSH KEY, or each instance must be configured correctly in `~/.ssh/config`.