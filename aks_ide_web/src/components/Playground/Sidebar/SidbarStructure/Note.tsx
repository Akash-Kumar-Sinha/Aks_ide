import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code, Shield, Zap } from "lucide-react";

const Note = () => {
  return (
    <div className="h-full bg-[#000000]">
      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-6 bg-[#000000] text-[#cccccc]">
          {/* Header Section */}
          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#333333]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-[#569cd6] flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#569cd6]">
                Welcome to Aks IDE
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-[#cccccc]">
              A powerful web-based development environment that provides each
              user with an{" "}
              <span className="text-[#569cd6] font-semibold">
                isolated virtual machine
              </span>
              . Install any compiler or tool, and start coding instantly with{" "}
              <span className="text-[#569cd6] font-semibold">
                minimum setup required
              </span>
              .
            </p>
          </div>

          {/* Terminal Module Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-[#569cd6]" />
              <h2 className="text-lg font-bold text-[#569cd6]">
                Terminal Module – The Heart of Aks IDE
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-[#cccccc]">
              The Terminal Module enables real-time, browser-based access to a
              fully functional Linux shell, powering code execution, file
              handling, and developer tooling seamlessly.
            </p>

            <div className="rounded-lg overflow-hidden border border-[#333333]">
              <img
                src="image.png"
                alt="Aks IDE Terminal Module"
                className="w-full"
              />
            </div>

            {/* Key Features */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
              <h3 className="text-sm font-semibold text-[#569cd6] mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#569cd6] mt-1.5 flex-shrink-0"></div>
                  <span className="text-[#cccccc]">
                    Real-time Linux shell in isolated Ubuntu-based Docker
                    container
                  </span>
                </li>
                <li className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#569cd6] mt-1.5 flex-shrink-0"></div>
                  <span className="text-[#cccccc]">
                    Supports command execution, package installs, and custom
                    scripts
                  </span>
                </li>
                <li className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#569cd6] mt-1.5 flex-shrink-0"></div>
                  <span className="text-[#cccccc]">
                    WebSocket-powered bidirectional I/O for instant
                    communication
                  </span>
                </li>
                <li className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#569cd6] mt-1.5 flex-shrink-0"></div>
                  <span className="text-[#cccccc]">
                    xterm.js frontend for responsive and intuitive terminal UI
                  </span>
                </li>
                <li className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#569cd6] mt-1.5 flex-shrink-0"></div>
                  <span className="text-[#cccccc]">
                    Pre-configured support for Node.js, Python, Rust, and more
                  </span>
                </li>
              </ul>
            </div>

            {/* Demo Links */}
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://drive.google.com/file/d/1lsRfhyKzmDOu24aeY3xtF6QpcKJjdgNM/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] hover:border-[#569cd6] transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#569cd6]" />
                  <span className="text-sm font-medium text-[#569cd6] group-hover:text-[#79c0ff]">
                    Watch Aks IDE in Action
                  </span>
                </div>
                <p className="text-xs text-[#808080] mt-1">
                  Rust Server Branch Demo
                </p>
              </a>

              <a
                href="https://drive.google.com/file/d/11ykA2aA7gbdgfaeedPh0G2Spd1P8DdyW/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] hover:border-[#569cd6] transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-[#569cd6]" />
                  <span className="text-sm font-medium text-[#cccccc] group-hover:text-[#569cd6]">
                    Legacy Terminal Module
                  </span>
                </div>
                <p className="text-xs text-[#808080] mt-1">
                  Main Branch Implementation
                </p>
              </a>
            </div>

            {/* Technical Architecture */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
              <h3 className="text-sm font-semibold text-[#569cd6] mb-3">
                Technical Architecture
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Backend:</span>
                    <span className="text-[#cccccc] font-mono">
                      Rust (Axum)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Frontend:</span>
                    <span className="text-[#cccccc] font-mono">
                      React + xterm.js
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Protocol:</span>
                    <span className="text-[#cccccc] font-mono">WebSockets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Core:</span>
                    <span className="text-[#cccccc] font-mono">PTY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Limitations & Roadmap */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#f85149]" />
              <h2 className="text-lg font-bold text-[#f85149]">
                Current Limitations & Development Roadmap
              </h2>
            </div>

            <p className="text-sm text-[#808080] leading-relaxed">
              As an evolving platform, Aks IDE has areas for improvement. Here's
              our transparent roadmap for addressing current limitations and
              upcoming features.
            </p>

            {/* Current Limitation */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#f85149] border-opacity-30">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#f85149]"></div>
                <h3 className="text-sm font-semibold text-[#f85149]">
                  Known Issue
                </h3>
              </div>
              <h4 className="text-sm font-medium text-[#cccccc] mb-1">
                Ephemeral Storage
              </h4>
              <p className="text-xs text-[#808080] leading-relaxed">
                While mitigated to some extent, data loss remains possible.
                We're actively working on permanent solutions.
              </p>
            </div>

            {/* Roadmap Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#569cd6]">
                Upcoming Features
              </h3>

              <div className="grid gap-3">
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#3fb950]"></div>
                    <h4 className="text-sm font-medium text-[#3fb950]">
                      Persistent Storage Solutions
                    </h4>
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    Docker volume integration to ensure user files are safely
                    retained across sessions.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#569cd6]"></div>
                    <h4 className="text-sm font-medium text-[#569cd6]">
                      Cloud Backup Integration
                    </h4>
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    Optional S3 storage integration for automatic file backup
                    and synchronization.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#569cd6]"></div>
                    <h4 className="text-sm font-medium text-[#569cd6]">
                      MCP Integration
                    </h4>
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    Evolution into a{" "}
                    <span className="font-semibold">
                      Modular Cloud Platform
                    </span>{" "}
                    client with distributed computing capabilities.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#a5a5f4]"></div>
                    <h4 className="text-sm font-medium text-[#a5a5f4]">
                      Multi-Server Scalability
                    </h4>
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    Multi-server orchestration for enhanced scale, reliability,
                    and distributed workflows.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#3fb950]"></div>
                    <h4 className="text-sm font-medium text-[#3fb950]">
                      Desktop Application
                    </h4>
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed">
                    Fully offline-capable desktop app for seamless development
                    without network dependencies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Collaboration */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#569cd6]"></div>
              <h3 className="text-sm font-semibold text-[#569cd6]">
                Collaboration & Feedback
              </h3>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed mb-3">
              Building a platform for developers, by developers. Your feedback
              directly shapes our roadmap. Have suggestions or want to
              collaborate?
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#808080]">Contact:</span>
              <a
                href="mailto:akashkumarsinha403@gmail.com"
                className="text-xs text-[#569cd6] hover:text-[#79c0ff] font-mono"
              >
                akashkumarsinha403@gmail.com
              </a>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Note;
