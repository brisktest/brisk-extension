# Brisk VS Code extension 5 minute Development Speedrun 

## Getting Started

### What

VS Code extension for Brisk

### Why

Brisk runs your tests really fast and it can run from your developer environment running your entire test suite in the cloud on every single save. The demo of react that we use finishes in 12 seconds that is fast enough to run your test suite every time you save.

Lets make the Brisk VS Code extension to enable that behavior and learn a little bit about how VS Code extensions work in the process.

They are pretty neat!


# Lets Get Started

### Create the extension

```shell
npx --package yo --package generator-code -- yo code
```

This starts the vscode extension creator which makes a new project with everything you need for an extension. I chose Typescript, esbuild and yarn. There were a bunch of worrying warnings from yarn about memory leaking packages which I may or may not investigate in the future.


At the end of the extension generator it prompts you to open the project in Code - do this.


Inside the editor, open src/extension.ts and press F5 or run the command Debug: Start Debugging from the Command Palette (⇧⌘P). This will compile and run the extension in a new Extension Development Host window.

Run the Hello World command from the Command Palette (⇧⌘P) in the new window:



### Running the extension

So the process here is to go to the extension and run it - this will create a new vs code window where your extension is active. 
You can then call the command you specified in the command palette (in this case hello world) and it will show up on the bottom as a notification - do that. This is going to be our developing loop for the next while. 

### First thing - change the output

I'm changing to 

vscode.window.showInformationMessage('Hello Peaceful World from Brisk!');

let us save
no restart - go to the second window and run "Hello World in the command palette"

### Great that works.

Now we want to change the command name

I'm going to change it to be "helloPeacefulWorld"

so I change
```typescript
	let disposable = vscode.commands.registerCommand('brisk.helloPeacefulWorld', () => {
```
    
in the extension

and in package.json
```json
  "commands": [
      {
        "command": "brisk.helloPeacefulWorld",
        "title": "Hello World"
      }
    ]

```

Lets see if that worked?

nope..

Still has the command as Hello World...

..ok

maybe I need to also change the title in the package.json
```json
    "commands": [
      {
        "command": "brisk.helloPeacefulWorld",
        "title": "Hello Peaceful World"
      }
    ]
```


Yes!

So, two main things we want to do now. 


- Figure out how to run a command instead of printing
- Figure out how to execute our command on save 


###  Lets change the name to Run Brisk

```json
    "commands": [
      {
        "command": "brisk.run",
        "title": "Run Brisk"
      }
    ]
```
and in extension.ts
```typescript
	let disposable = vscode.commands.registerCommand('brisk.run', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello Peaceful World from Brisk!');
	});
```

### Lets figure out how to run a shell command

Apparently Terminal what we are interested in and "sendText()" sends content to the Terminal. Lets incorporate that.
```typescript


	vscode.window.onDidChangeActiveTerminal(e => {
		console.log(`Active terminal changed, name=${e ? e.name : 'undefined'}`);
	});
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('brisk.run', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello Peaceful World from Brisk!');
		const terminal = vscode.window.activeTerminal || vscode.window.createTerminal(`Brisk ${NEXT_TERM_ID++}`);

		terminal.sendText("echo 'Sent text immediately after creating'");
		const workspaceFolder = getWorkspaceFolder();
		terminal.sendText(`cd ${workspaceFolder} && brisk`);
		terminal.show(true);
		terminal.processId.then(pid => {
			console.log(`Terminal process ID: ${pid}`);
		}
		);

	});

```

# Settings


Now lets add the code for the settings into the activation

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "brisk" is now active!');

  // Define default settings
  const defaultSettings = {
    "brisk.configFile": "brisk.json",
  };

  // Load user settings
  const config = vscode.workspace.getConfiguration();
  let configFile = config.get(
    "brisk.configFile",
    defaultSettings["brisk.configFile"]
  );

  // Listen for changes in user settings
  const disposableConfigUpdater = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("brisk.configFile")) {
        // User setting changed, update your extension accordingly
        const updatedSetting = config.get(
          "brisk.configFile",
          defaultSettings["brisk.configFile"]
        );
        console.log(
          `Updated setting: ${updatedSetting} - we will use it on the next run`
        );
        configFile = updatedSetting;
      }
    }
  );

  console.log("Brisk: the config file is ", configFile)

  // When your extension is deactivated, clean up your resources
  context.subscriptions.push(disposableConfigUpdater);

  vscode.window.onDidChangeActiveTerminal((e) => {
    console.log(`Active terminal changed, name=${e ? e.name : "undefined"}`);
  });
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("brisk.run", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello Peaceful World from Brisk!");
    const terminal =
      vscode.window.activeTerminal ||
      vscode.window.createTerminal(`Brisk ${NEXT_TERM_ID++}`);

    terminal.sendText("echo 'Sent text immediately after creating'");
    const workspaceFolder = getWorkspaceFolder();
    terminal.sendText(`cd ${workspaceFolder} && brisk`);
    terminal.show(true);
    terminal.processId.then((pid) => {
      console.log(`Terminal process ID: ${pid}`);
    });
  });

  context.subscriptions.push(disposable);
}
```

> **_NOTE:_** We are writing to the console, where is the console actually displayed?
              Open vscode and go to menu "Help"->"Toggle Developer Tools" and the console is displayed on the right 


Check the console - see if we are outputing the correct config file? 
Yea great. Lets see if we can change it now

My first instinct is to check the settings.json
Ok that didn't work, I can't find my extensions settings anywhere.

From Stack Overflow

```json
"configuration": {
    "title": "Just a title",
    "properties": {
        "myextensionname.mysetting": {
            "type": "boolean",
            "default": "false",
            "description": "This does something"
        }
    }
}
```

Makes sense, I need to define the config of my extension in the package.json first.


ok So updating this

```json
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "brisk.run",
        "title": "Run Brisk"
      }
    ],

    "configuration": {
      "title": "General",
      "properties": {
          "brisk.configFile": {
              "type": "string",
              "default": "brisk.json",
              "description": "The project configuration file to use for Brisk"
          }
      }
  }
  },
  ```

  that is the snippet I've added. Lets see if restarting things helps and we can find the settings in the settings pane.

  Yes it works. I can now find the brisk.json config file default. 

  I'm restarting the extension each time which for the moment kicks off a new run of brisk on each activation - we'll change that in a bit but for now you can just kill the output or wait for it to finish.

### Changing a Setting

  Lets change the default file and see if it updates, I'm going to change it to 
  
  brisk-ci.json

  So I updated it and waited for the console output - I got output to say we were updating but it still had the old value there hmmmm....

  Lets change it again and see if it is just always showing the last one or always shows the same output

  So I change it to "someothername.json"

  Nope it keeps printing the first value it loaded with, even though it knows it got updated cause it called the handler.


Ahhhh the config needs to be refetched after the event gets in, I assumed the config would automatically update but not so.

```typescript

  // Load user settings
  let config = vscode.workspace.getConfiguration();
  let configFile = config.get(
    "brisk.configFile",
    defaultSettings["brisk.configFile"]
  );

  console.log("Brisk: the config file is ", configFile);

  // Listen for changes in user settings
  const disposableConfigUpdater = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("brisk.configFile")) {
		let config = vscode.workspace.getConfiguration();

        // User setting changed, update your extension accordingly
        const updatedSetting = config.get(
          "brisk.configFile",
          defaultSettings["brisk.configFile"]
        );
        console.log(
          `Updated setting: ${updatedSetting} - we will use it on the next run`
        );
        configFile = updatedSetting;
      }
    }
  );

```

So we need to change the config from a const to a let and then grab it again and update the value we use.

So it seems like we are going to need to check the config all the time or run this update loop. 
Maybe we just grab the values when we need them - to simplify everything.


```typescript
  let disposable = vscode.commands.registerCommand("brisk.run", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello Peaceful World from Brisk!");
    const terminal =
      vscode.window.activeTerminal ||
      vscode.window.createTerminal(`Brisk ${NEXT_TERM_ID++}`);

    const workspaceFolder = getWorkspaceFolder();
	  // Load user settings
	  let config = vscode.workspace.getConfiguration();
	  let configFile = config.get(
		"brisk.configFile",
		defaultSettings["brisk.configFile"]
	  );
	
    terminal.sendText(`cd ${workspaceFolder} && BRISK_CI=true brisk -c ${configFile}`);
    terminal.show(true);
    terminal.processId.then((pid) => {
      console.log(`Terminal process ID: ${pid}`);
    });
  });

  context.subscriptions.push(disposable);
}


```

We then run it once and make sure the default setting is used. Then we can update the config and run the command again using the command palette and we see our updated config file in the terminal. Success!

We also switched to CI mode so that we don't watch by passing BRISK_CI=true to the command.

Lets also add a configuration setting for the API server so that people can point the CLI at their own backend

This now becomes

```typescript

	  let apiEndpoint = config.get("brisk.apiEndpoint", "");

      terminal.sendText(
        `cd ${workspaceFolder} && BRISK_APIENDPOINT=${apiEndpoint} BRISK_CI=true brisk -c ${configFile}`
      );
```      

# On Save

Now we'd like to run the command on every save. 

Lets update the contribues part of the package.json to let VS Code know about our keybindings. It looks like it takes a keybindings field, so lets see if we can put something there. 

```json
  "contributes": {
    "commands": [
      {
        "command": "brisk.run",
        "title": "Run Brisk"
      }
    ],

    "configuration": {
      "title": "General",
      "properties": {
          "brisk.configFile": {
              "type": "string",
              "default": "brisk.json",
              "description": "The project configuration file to use for Brisk"
          }
      }
  },
  "keybindings": [
    {
      "command": "brisk.run",
      "key": "ctrl+s",
      "mac": "cmd+s",
      "when": "editorTextFocus"
    }
  ]
  ```


  Nope that doesn't seem to work...

  ahhh weird - it works but not in the extension window - it works in the VS Code where I'm calling the extension from. Maybe that is all we need.
  Seems like on reload it's working in the extension window - some weirdness but we seem to be on the right track.

  The extension.ts now looks like

  ```typescript
  // The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

var NEXT_TERM_ID = 1;

export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "brisk" is now active!');

  // Define default settings
  const defaultSettings = {
    "brisk.configFile": "brisk.json",
  };


  let disposable = vscode.commands.registerCommand("brisk.run", () => {
    const terminal =
      vscode.window.activeTerminal ||
      vscode.window.createTerminal(`Brisk ${NEXT_TERM_ID++}`);

    const workspaceFolder = getWorkspaceFolder();
	  // Load user settings
	  let config = vscode.workspace.getConfiguration();
	  let configFile = config.get(
		"brisk.configFile",
		defaultSettings["brisk.configFile"]
	  );
	
    terminal.sendText(`cd ${workspaceFolder} && brisk -c ${configFile}`);
    terminal.show(true);
    terminal.processId.then((pid) => {
      console.log(`Terminal process ID: ${pid}`);
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWorkspaceFolder(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    return folders[0].uri.fsPath;
  }
  const message =
    "Brisk: Working folder not found, open a folder and try again";

  vscode.window.showErrorMessage(message);
  return "";
}



```

There is one final piece of the puzzle. 

If Brisk is already running and we hit save what do we want to do?
- Wait for it to finish and then run it again
- Kill the current run and start another

I'm unsure about this. Often if you've just changed something and hit save and then save again you want to cancel the previous run and start again. However if someone has a really long running test suite maybe they want the previous run to finish. That said, I think people always want their most recent run to happen. So, we will kill any existing job and start again. 

We'll also debounce for a split second in case someone mashes the save button a few times.

So what does all this look like - to extension.js



```typescript
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as childProcess from "child_process";

var NEXT_TERM_ID = 1;
var latestRun = 0;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "brisk" is now active!');

  // Define default settings
  const defaultSettings = {
    "brisk.configFile": "brisk.json",
  };

  let runningTerminalProcess: number | undefined;

  let disposable = vscode.commands.registerCommand("brisk.run", () => {
    let config = vscode.workspace.getConfiguration();
    latestRun++;
    let myLatestRun = latestRun;
    console.debug("Starting run " + myLatestRun);
    setTimeout(() => {
      if (myLatestRun !== latestRun) {
        console.debug("Skipping run because a new run was started.");
        return;
      }

      vscode.window.terminals.forEach((oldTerminal) => {
        oldTerminal.processId.then((pid) => {
          if (pid === runningTerminalProcess) {
            console.debug("Killing old brisk run");
            oldTerminal.dispose();
          }
        });
      });

      const terminal = vscode.window.createTerminal(`Brisk ${NEXT_TERM_ID++}`);

      const workspaceFolder = getWorkspaceFolder();
      // Load user settings

      let configFile = config.get(
        "brisk.configFile",
        defaultSettings["brisk.configFile"]
      );

      terminal.sendText(
        `cd ${workspaceFolder} && BRISK_CI=true brisk -c ${configFile}`
      );
      terminal.show(true);
      terminal.processId.then((pid) => {
        console.log(`Terminal process ID: ${pid}`);
        runningTerminalProcess = pid;
      });
    }, config.get("brisk.delay", 100));
  });

  context.subscriptions.push(disposable);
}


function getWorkspaceFolder(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    return folders[0].uri.fsPath;
  }
  const message =
    "Brisk: Working folder not found, open a folder and try again";

  vscode.window.showErrorMessage(message);
  return "";
}


// This method is called when your extension is deactivated
export function deactivate() {
	  console.log('Extension Brisk is now deactivated!');
}
```

We also want to make the extension active whenever there is a brisk config in the working directory 

We add this to our package.json
,
```json
  "activationEvents": [
    "onCommand:brisk.run",
    "workspaceContains:**/brisk.json"
  ]
  },
```



Great that seems to all work pretty well - lets see how we publish it

https://code.visualstudio.com/api/working-with-extensions/publishing-extension

I need to create an org in Azure devops and generate a security token.

Turns out we need to use a tool called vsce which we install with 

```shell
npm install -g @vscode/vsce
```

We then use

```shell

$ cd brisk-extension
$ vsce package
# myExtension.vsix generated
$ vsce publish
# <publisher id>.myExtension published to VS Code Marketplace
```

