export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-400">
            Built for <span className="font-semibold text-emerald-400">The Synthesis 2026</span> | Nansen CLI Challenge
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a
              href="https://github.com/TruePrav/oracle-synthesis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <span className="text-gray-700">|</span>
            <a
              href="https://t.me/OracleAITradingBot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Telegram Bot
            </a>
            <span className="text-gray-700">|</span>
            <span>Oracle v3 &mdash; Smart Money Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
