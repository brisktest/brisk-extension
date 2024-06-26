// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as childProcess from "child_process";
import { TextDocument, workspace } from "vscode";

var NEXT_TERM_ID = 1;
var latestRun = 0;
  // Define default settings
  const defaultSettings = {
    "brisk.configFile": "brisk.json",
    "brisk.apiEndpoint": "",
    "brisk.languages": ["javascript","javascriptreact", "typescript", "python","ruby","haml","html","css","scss","sass"],

  };

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "brisk" is now active!');



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

	  let apiEndpoint = config.get("brisk.apiEndpoint", "");

      terminal.sendText(
        `cd ${workspaceFolder} && BRISK_APIENDPOINT=${apiEndpoint} BRISK_CI=true brisk -c ${configFile}`
      );
      terminal.show(true);
      terminal.processId.then((pid) => {
        console.log(`Terminal process ID: ${pid}`);
        runningTerminalProcess = pid;
      });
    }, config.get("brisk.delay", 20));
  });

  context.subscriptions.push(disposable);
}

workspace.onDidSaveTextDocument((document: TextDocument) => {
  const config = vscode.workspace.getConfiguration();
  if (config.get("brisk.languages",defaultSettings["brisk.languages"]).includes(document.languageId) && document.uri.scheme === "file") {
    vscode.commands.executeCommand("brisk.run");
  }
});

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
  console.log("Extension Brisk is now deactivated!");
}
