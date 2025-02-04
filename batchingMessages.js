import { useEffect, useRef } from "react";

const useBatchedMessages = (url, onBatchMessage, batchInterval = 100) => {
  const batchRef = useRef([]);
  const socket = useWebSocket(url, (message) => {
    batchRef.current.push(message);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (batchRef.current.length) {
        onBatchMessage(batchRef.current);
        batchRef.current = [];
      }
    }, batchInterval);

    return () => {
      clearInterval(interval);
    };
  }, [batchInterval, onBatchMessage]);
};
