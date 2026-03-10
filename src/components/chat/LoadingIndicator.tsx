export default function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
