# zchat
ZChat is an interactive media rendering chat service which aims to enhance the user's chat experience.  It includes simple syntax for rendering images, videos, and formatted text.

This project contains the frontend and a backend testbench for the `zchat` application.

## Requirements
The following are required to use the testbench:

* [Node.js](https://nodejs.org/)

## Setup
Navigate to the base folder and run:

```bash
$ npm install
```

This will install all requirements for the local project.  Then to start the server, run:

```bash
$ node server.js
```

This will begin an interactive session where you can type messages into the terminal and have it render in a web browser.

Navigate to the page: [http://localhost:8081](http://localhost:8081) and you will see the empty client.  Whenever you type a message into the server console, it should render to this client.

**Warning**: Do **NOT** open more than one client at a time, or else it may not render properly.


## Syntax
The syntax is as follows:

* Basic text is rendered without any special characters attached.
* *Italic* text results from any text between one asterix symbol: (eg. `*this will render italic*`)
* **Bold** text results from any text between two asterix symbols: (eg. `**this will render bold**`)
* ***Bold + Italic*** text results from any text between three asterix symbols: (eg. `***this will be bold+italic***`)
* ~~Strikethrough~~ text results from any text between two tilde symbols: (eg. `~~this will be strikethrough~~`)
* <u>Underlined</u> text results from any text between underscores: (eg. `_this will be underlined_`) 
* Media (eg images or videos) are rendered by using the syntax: `![http://link_to_media.png]`
* Formatting is accomplished via the syntax: `{text you want to format;<rule1>=<value>, <rule2>=<value>}`.  The following formatting rules are included:
  * Color is specified with either `color=<colorname>` or by `color=#RRGGBB`.  You can also exclude the `color` keyword for simplicity as long as it is the first parameter.  Examples: `{This text will be red;red}`, `{This text will be blue;#0000FF}`, `{This text will be rainbow;rainbow}`, `{This text will blink;blink}`
