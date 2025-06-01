import useTheme from "../../../ui/lib/useTheme";

const Note = () => {
  const { theme } = useTheme();

  return (
    <div
      className="max-w-4xl mx-auto p-6 rounded-lg shadow-sm border space-y-6"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        borderColor: theme.primaryShade,
      }}
    >
      {/* Header Section */}
      <div
        className="p-4 rounded-lg border-l-4"
        style={{
          backgroundColor: theme.backgroundColor,
          borderLeftColor: theme.primaryColor,
        }}
      >
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.primaryColor }}
        >
          Welcome to Aks IDE
        </h2>
        <p
          className="text-base leading-relaxed"
          style={{ color: theme.textColor }}
        >
          You might be thinking this is just another web-based code editor — and
          you're absolutely right. But what sets <strong>Aks IDE</strong> apart
          is the power and flexibility it offers behind the scenes. Every user
          is provided with an <strong>isolated virtual machine</strong>, giving
          them the freedom to install any compiler or tool they want and start
          coding instantly. All you need to do is
          <strong> log in and begin your journey</strong> — no complicated setup
          required.
        </p>
      </div>

      {/* Terminal Module Overview */}
      <div className="space-y-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: theme.primaryColor }}
        >
          Terminal Module – The Heart of Aks IDE
        </h3>
        <p className="text-sm" style={{ color: theme.textColor }}>
          The Terminal Module is the core of Aks IDE, enabling real-time,
          browser-based access to a fully functional Linux shell. It powers code
          execution, file handling, and developer tooling in a seamless way.
        </p>

        <img
          src="image.png"
          alt="Aks IDE Terminal Module"
          className="rounded-lg w-full border"
          style={{ borderColor: theme.primaryColor }}
        />

        <ul
          className="list-disc list-inside text-sm space-y-1"
          style={{ color: theme.textColor }}
        >
          <li>
            Real-time Linux shell in an isolated Ubuntu-based Docker container.
          </li>
          <li>Supports command execution, package installs, and scripts.</li>
          <li>WebSocket-powered bidirectional I/O.</li>
          <li>xterm.js frontend for responsive terminal UI.</li>
          <li>Supports tools like Node.js, Python, Rust, and more.</li>
        </ul>

        <p className="text-sm">
          <a
            href="https://drive.google.com/file/d/1lsRfhyKzmDOu24aeY3xtF6QpcKJjdgNM/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.primaryColor }}
          >
            Watch Aks IDE in Action (Rust Server Branch)
          </a>
        </p>

        <p className="text-sm">
          <a
            href="https://drive.google.com/file/d/11ykA2aA7gbdgfaeedPh0G2Spd1P8DdyW/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.textColor }}
          >
            View the Legacy Terminal Module (Main Branch)
          </a>
        </p>

        {/* Terminal Architecture */}
        <div>
          <h4 className="font-medium mb-1" style={{ color: theme.infoColor }}>
            Terminal Architecture
          </h4>
          <ul
            className="text-sm list-disc list-inside"
            style={{ color: theme.textColor }}
          >
            <li>Backend: Rust (Axum)</li>
            <li>Frontend: React + xterm.js</li>
            <li>Communication: WebSockets</li>
            <li>Terminal Core: PTY (Pseudo-Terminal)</li>
          </ul>
        </div>
      </div>

      {/* Limitations & Roadmap Section */}
      <div className="space-y-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: theme.warningColor }}
        >
          Current Limitations & Roadmap
        </h3>

        <p className="text-sm" style={{ color: theme.textDimmed }}>
          Like any evolving platform, Aks IDE does have its limitations. Here's
          what I'm working on:
        </p>

        <div className="grid gap-4 mt-4">
          {/* Ephemeral Storage */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.errorColor,
            }}
          >
            <h4
              className="font-medium mb-1"
              style={{ color: theme.errorColor }}
            >
              Ephemeral Storage
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              While I've mitigated this issue to an extent, data loss is still
              possible.
            </p>
          </div>

          {/* Persistent Storage */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.successColor,
            }}
          >
            <h4
              className="font-medium mb-1"
              style={{ color: theme.successColor }}
            >
              Persistent Storage Solutions
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              I'm actively working on persistent storage using Docker volumes to
              retain user files safely.
            </p>
          </div>

          {/* Cloud Backup */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.infoColor,
            }}
          >
            <h4 className="font-medium mb-1" style={{ color: theme.infoColor }}>
              Cloud Backup Integration
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              Optional S3 storage integration is in the pipeline to
              automatically back up user files.
            </p>
          </div>

          {/* MCP Integration */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.primaryColor,
            }}
          >
            <h4
              className="font-medium mb-1"
              style={{ color: theme.primaryColor }}
            >
              MCP Integration
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              Aks IDE will evolve into a <strong>Modular Cloud Platform</strong>{" "}
              client with distributed computing capabilities.
            </p>
          </div>

          {/* Multi-Server */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.accentColor,
            }}
          >
            <h4
              className="font-medium mb-1"
              style={{ color: theme.accentColor }}
            >
              Multi-Server Scalability
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              Multi-server orchestration will offer scale, reliability, and
              distributed workflows.
            </p>
          </div>

          {/* Desktop App */}
          <div>
            <h4
              className="font-medium mb-1"
              style={{ color: theme.successColor }}
            >
              Desktop App Experience
            </h4>
            <p className="text-sm" style={{ color: theme.textColor }}>
              A fully offline-capable desktop app is coming soon. Just install
              and start building – no delays.
            </p>
          </div>

          {/* Feedback */}
          <div>
            <h4
              className="font-medium mb-1"
              style={{ color: theme.primaryColor }}
            >
              Collaboration & Feedback
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textColor }}
            >
              I'm building a platform for developers, by developers. Your
              feedback shapes the roadmap. Have suggestions or want to
              collaborate? Reach out at{" "}
              <strong style={{ color: theme.primaryColor }}>
                akashkumarsinha403@gmail.com
              </strong>
              <br />
              <span style={{ color: theme.textDimmed }}>
                Also, the UI is built entirely using a library I'm developing.
                Interested? Drop me an email to get notified at launch.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div
        className="p-4 rounded-lg text-center border"
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: theme.primaryColor,
        }}
      >
        <p className="text-sm" style={{ color: theme.textDimmed }}>
          We're constantly evolving and appreciate your patience as we build the
          future of cloud-based development!
        </p>
      </div>
    </div>
  );
};

export default Note;
