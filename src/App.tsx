import { useState, useRef, useEffect } from "react";
import "./App.css";
import { title, uncannyMrIncredible } from "./ascii-art";

interface HistoryEntry {
  command: string;
  output: string;
  timestamp: Date;
  path: string;
}

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: "",
      output: title,
      timestamp: new Date(),
      path: "~",
    },
  ]);
  const [currentPath, setCurrentPath] = useState("~");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const directories: Record<string, string[]> = {
    "~": [
      "Documents",
      "Downloads",
      "Pictures",
      "Projects",
      "Music",
      "Videos",
      "Desktop",
      ".bashrc",
      ".profile",
      ".gitconfig",
      "README.md",
      "CV.md",
    ],
    "~/Documents": ["file1.txt", "file2.pdf", "notes.md"],
    "~/Downloads": ["setup.exe", "image.jpg", "archive.zip"],
    "~/Pictures": ["vacation.jpg", "family.png", "screenshot.png"],
    "~/Projects": ["terminal-website", "my-app", "scripts"],
    "~/Music": ["song1.mp3", "album", "playlist.m3u"],
    "~/Videos": ["movie.mp4", "tutorial.avi", "clips"],
    "~/Desktop": ["shortcut.lnk", "temp.txt"],
  };

  const fileContents: Record<string, string> = {
    "~/.bashrc": `# ~/.bashrc: executed by bash(1) for non-login shells.

export PATH=$PATH:/usr/local/bin
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# Terminal colors
export TERM=xterm-256color`,

    "~/.profile": `# ~/.profile: executed by the command interpreter for login shells.

if [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi`,

    "~/.gitconfig": `[user]
    name = visitor
    email = visitor@terminal-website.com

[core]
    editor = nano
    autocrlf = input

[alias]
    st = status
    co = checkout
    br = branch`,

    "~/README.md": `# Terminal Website

A web-based terminal simulator built with React and TypeScript.

## Features
- Interactive command-line interface
- File system navigation
- Basic Unix commands
- Responsive design

## Available Commands
- ls, cd, pwd
- cat, echo, date
- help, clear, about

`,
    "~/CV.md": `# NUSRET ALI KIZILASLAN

## EDUCATION
--------------------------------------------------------
* Sabancı University - June 2024 * İstanbul, Türkiye
  - B.A in Computer Science & Engineering, Faculty of Engineering and Natural Sciences
  - Minor in Finance

* TED İstanbul College

## JOB EXPERIENCE
--------------------------------------------------------
* Valensas (Software Engineer) - June 2024 * İstanbul, Türkiye
  - Currently working as a software engineer. Developing back-end and front-end applications for businesses.

* Kordsa The Reinforcer (Software Engineer) - July 2022 * İstanbul, Türkiye
  - Developed two major mobile applications DataCom and KordsaConnect that are widely used in the
company. Contributed to the development of company chatbot.

## TEACHING EXPERIENCE
--------------------------------------------------------
* Undergraduate Teaching Assistant - February 2023 * İstanbul, Türkiye
  - Worked as undergraduate teaching assistant for the course CS 303 Logic and Digital System Design.
Held lab sessions, office hours, and proctoring.
`,

    "~/Documents/file1.txt": `This is a sample text file.
It contains multiple lines of text
to demonstrate the cat command functionality.

Line 4: Hello World!
Line 5: Terminal Website Demo`,

    "~/Documents/file2.pdf": `[PDF Content - Binary file]
This is a PDF document that contains formatted text,
but since this is a terminal simulation,
we're showing a text representation.

Document Title: Sample PDF
Pages: 3
Created: 2024`,

    "~/Documents/notes.md": `# My Notes

## Todo List
- [x] Set up terminal website
- [ ] Add more commands
- [ ] Implement file editing

## Ideas
- Add syntax highlighting
- Create multiple terminal tabs
- Add command history with arrow keys

*Last updated: Today*`,

    "~/Desktop/temp.txt": `Temporary file for testing.
This file can be safely deleted.

Created: $(date)
Purpose: Testing cat command`,
  };

  const commands: Record<string, (args: string[]) => string> = {
    help: () => `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  echo     - Echo back the arguments
  date     - Show current date and time
  pwd      - Show current directory
  ls       - List directory contents
  cd       - Change directory
  cat      - Display file contents
  rm       - Remove files and directories
  about    - About this terminal
  whoami   - Show current user`,

    clear: () => {
      setHistory([]);
      return "";
    },

    echo: (args) => args.join(" "),

    date: () => new Date().toString(),

    pwd: () => currentPath,

    ls: () => {
      const contents = directories[currentPath] || [];
      if (contents.length === 0) {
        return "Directory is empty";
      }
      return contents
        .map((item) =>
          directories[`${currentPath}/${item}`] ||
          directories[`${currentPath === "~" ? "~" : currentPath}/${item}`]
            ? `${item}/`
            : item
        )
        .join("    ");
    },

    cd: (args) => {
      if (args.length === 0) {
        setCurrentPath("~");
        return "";
      }

      const target = args[0];
      let newPath: string;

      if (target === "..") {
        if (currentPath === "~") {
          return "";
        }
        const pathParts = currentPath.split("/");
        pathParts.pop();
        newPath = pathParts.length === 1 ? "~" : pathParts.join("/");
      } else if (target.startsWith("~/")) {
        newPath = target;
      } else if (target.startsWith("/")) {
        return `cd: ${target}: No such file or directory`;
      } else {
        newPath =
          currentPath === "~" ? `~/${target}` : `${currentPath}/${target}`;
      }

      if (directories[newPath]) {
        setCurrentPath(newPath);
        return "";
      } else {
        return `cd: ${target}: No such file or directory`;
      }
    },

    cat: (args) => {
      if (args.length === 0) {
        return "cat: missing file operand";
      }

      const filename = args[0];
      let filePath: string;

      // Handle absolute paths and relative paths
      if (filename.startsWith("~/")) {
        filePath = filename;
      } else if (filename.startsWith("./")) {
        filePath =
          currentPath === "~"
            ? `~/${filename.slice(2)}`
            : `${currentPath}/${filename.slice(2)}`;
      } else if (filename.startsWith("/")) {
        return `cat: ${filename}: No such file or directory`;
      } else {
        filePath =
          currentPath === "~" ? `~/${filename}` : `${currentPath}/${filename}`;
      }

      // Check if it's a file (exists in fileContents) and not a directory
      if (fileContents[filePath]) {
        return fileContents[filePath];
      }

      // Check if it's a directory
      if (directories[filePath]) {
        return `cat: ${filename}: Is a directory`;
      }

      // Check if file exists in current directory listing
      const currentDirContents = directories[currentPath] || [];
      if (!currentDirContents.includes(filename)) {
        return `cat: ${filename}: No such file or directory`;
      }

      // File exists but no content defined - show placeholder
      return `cat: ${filename}: File is empty or binary`;
    },

    rm: (args) => {
      if (args.length === 0) {
        return "rm: missing operand";
      }

      if (args.includes("-rf") && args.includes(".")) {
        return uncannyMrIncredible;
      }

      // Check for other dangerous patterns
      if (
        args.includes("-rf") &&
        (args.includes("/") || args.includes("*") || args.includes("~"))
      ) {
        return "rm: Permission denied. You don't have the power to destroy everything here! 🛡️";
      }

      // Handle file/directory removal (simulate)
      const filename = args[args.length - 1]; // Get the last argument as filename
      const currentDirContents = directories[currentPath] || [];
      const hasRfFlag =
        args.includes("-rf") || (args.includes("-r") && args.includes("-f"));

      if (currentDirContents.includes(filename)) {
        // Check if it's a directory
        const potentialDirPath =
          currentPath === "~" ? `~/${filename}` : `${currentPath}/${filename}`;
        if (directories[potentialDirPath]) {
          if (hasRfFlag) {
            return `rm: '${filename}' and its contents have been removed`;
          } else {
            return `rm: ${filename}: is a directory`;
          }
        }
        return `rm: '${filename}' has been removed`;
      } else {
        return `rm: cannot remove '${filename}': No such file or directory`;
      }
    },

    about: () => `Terminal Website
A web-based terminal simulator built with React and TypeScript.
Created as a demonstration of modern web technologies.`,

    whoami: () => "visitor",
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const [command, ...args] = trimmed.split(" ");
    const output = commands[command.toLowerCase()]
      ? commands[command.toLowerCase()](args)
      : `Command not found: ${command}. Type 'help' for available commands.`;

    const newEntry: HistoryEntry = {
      command: trimmed,
      output,
      timestamp: new Date(),
      path: currentPath,
    };

    // Add command to history (avoid duplicates and empty commands)
    if (
      trimmed &&
      (!commandHistory.length ||
        commandHistory[commandHistory.length - 1] !== trimmed)
    ) {
      setCommandHistory((prev) => [...prev, trimmed]);
    }

    if (command.toLowerCase() === "clear") {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, newEntry]);
    }

    setInput("");
    setHistoryIndex(-1); // Reset history index after executing command
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    focusInput();
  }, []);

  return (
    <div className="terminal" onClick={focusInput} ref={terminalRef}>
      {history.map((entry, index) => (
        <div key={index} className="history-entry">
          {entry.command && (
            <div className="command-line">
              <span className="prompt">
                visitor@terminal-website:{entry.path}${" "}
              </span>
              <span className="command">{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <div
              className="output"
              dangerouslySetInnerHTML={{
                __html: entry.output.replace(/\n/g, "<br/>"),
              }}
            />
          )}
        </div>
      ))}

      <div className="current-line">
        <span className="prompt">visitor@terminal-website:{currentPath}$ </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input"
          spellCheck={false}
          autoFocus
        />
      </div>
    </div>
  );
}

export default App;
