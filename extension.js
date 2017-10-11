const vscode = require('vscode');

function activate(context) {
    let runRubyTest = vscode.commands.registerCommand('extension.runRubyTest', runRubyTestExec);
    context.subscriptions.push(runRubyTest);

    let runRubyCurrentLineTest = vscode.commands.registerCommand('extension.runRubyCurrentLineTest', runRubyCurrentLineTestExec);
    context.subscriptions.push(runRubyCurrentLineTest);
}
exports.activate = activate;

//
// Exec functions
//

function runRubyTestExec() {
    var filePath = _currentActiveFilePath();
    _executeCode("bundle exec ruby -I test "+ filePath);
}

function runRubyCurrentLineTestExec() {
    var currentLine = vscode.window.activeTextEditor.selection.active.line;
    var currentLineText = vscode.window.activeTextEditor.document.lineAt(currentLine).text;

    var testTitle = _isTextTestTitle(currentLineText);
    if ( testTitle ) {
        var filePath = _currentActiveFilePath();
        _executeCode("bundle exec ruby -I test "+ filePath +" -n /"+ _formatTestTitle(testTitle) +"/");
    } else {
        vscode.window.showInformationMessage("Can't run current line as it's not a Minitest test title");
    }
}

//
// Helper methods
//

function _formatTestTitle(title) {
    return title.replace(/#/g, "")
                .replace(/\ /g, "_")
                .replace(/!/g, "\\!")
                .replace(/'/g, "\\\\'");
}

function _isTextTestTitle(content) {
    if ( content.match(/test .+ do/) ) {
        var testTitle = content.match(/['|"](.+)['|"]/);

        if (testTitle[1]) {
            return testTitle[1];
        }
    }
}

function _currentActiveFilePath() {
    var fullFilePath = vscode.window.activeTextEditor.document.fileName;
    var projectFolder = vscode.workspace.rootPath;
    return fullFilePath.replace(projectFolder + "/", "");
}

function _executeCode(code) {
    var osascript = require('node-osascript')

    console.log(osascript)
    command = []
    command.push('tell application "iTerm2"');
    command.push('	tell current session of first window');
    command.push('		activate current session');
    command.push('		write text code');
    command.push('	end tell');
    command.push('end tell');
    command = command.join('\n');

    osascript.execute(command, {code: code}, function (error, result, raw) {
        console.log(code);

        if (error) {
            console.error("An error occurred: ");
            console.error(error);
        }
    });
}