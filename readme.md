# Bulletproof Grunt Email Template

In this repo you will find a grunt build system with 2 email templates (1024 width & 100% width). There are configurations for getting the mailing system setup however requires some configuration.

## Installation

```bash
npm i
npm i grunt-cli -g
```
If you are working on a unix bases machine install the following. 

```
brew install trash
```

## Editing Templates
Navigate to ```/dev``` to find the html templates. 

The SASS code is located in ``` /dev/stylesheets ```

There are a few files and folders to consider when building on the SASS stylesheets.

### dev/stylesheets/email

This folder is for all of your core styles and contains **_body.scss**, **_head.scss** and **_responsive.scss**

**_body.scss** -> This is for all of your core styles that will be injected inline with the with the element it's attached to.

**_head.scss** -> All code written here will be injected at the head of the page inside a <style> tag

**_responsive.scss** -> Same as the _head.scss this will be injected inside a <style> tag

### dev/stylesheets/dist

This folder is where the css files are built and where the SASS files link up the files and dependencies. 

## Building code

Simply use the following code to build

```
grunt build
```


If working on windows ignore and build using 

```grunt build --force```

Your now built files will exist in ```/build ``` under there respective names

(If you need to edit the names of your files or add more to your project locate the ``` emailBuilder``` in your gruntfile and add or remove files containing location of the build and the src of the file.)