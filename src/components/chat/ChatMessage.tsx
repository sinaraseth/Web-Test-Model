import { Message, processHtmlContent } from "../../services/responseChat.services";

interface ChatMessageProps {
  message: Message;
  sqlToggles: { [key: string]: boolean };
  onToggleSqlView: (messageId: string) => void;
}

export default function ChatMessage({
  message,
  sqlToggles,
  onToggleSqlView,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-4 relative ${
          message.type === "user"
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {message.sqlContent && (
          <button
            onClick={() => onToggleSqlView(message.id)}
            className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700 transition-colors z-10"
          >
            {sqlToggles[message.id] ? (
              <>
                <span>HTML</span>
              </>
            ) : (
              <>
                <span>SQL</span>
              </>
            )}
          </button>
        )}
        {message.imageUrl && (
          <div className="mb-3">
            <img
              src={message.imageUrl}
              alt={message.file?.name || "Uploaded image"}
              className="rounded-lg max-w-full h-auto max-h-64 object-contain"
            />
          </div>
        )}
        {message.htmlContent || message.sqlContent ? (
          <>
            {message.modelName && (
              <div className="mb-2 pb-2 border-b border-gray-300">
                <span className="font-semibold text-sm">
                  {message.modelName}
                </span>
              </div>
            )}
            {sqlToggles[message.id] && message.sqlContent ? (
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs font-mono">
                <code>{message.sqlContent}</code>
              </pre>
            ) : (
              <div
                className="prose prose-sm max-w-none overflow-x-auto wrap-break-word whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: processHtmlContent(
                    message.htmlContent || "",
                    message.prompt
                  ),
                }}
              />
            )}
          </>
        ) : (
          <>
            {message.modelName && (
              <div className="mb-2 pb-2 border-b border-gray-300">
                <span className="font-semibold text-sm">
                  {message.modelName}
                </span>
              </div>
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
          </>
        )}
        <span className="text-xs opacity-60 mt-2 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
