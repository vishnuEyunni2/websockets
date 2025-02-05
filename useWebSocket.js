import { useEffect, useRef } from "react";

const useWebSocket = (url, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(url);
    socketRef.current.onopen = () => console.log("Websocket connected!");
    socketRef.current.onmessage = (event) => onMessage(JSON.parse(event.data));
    socketRef.current.onclose = () => console.log("Websocket disconnected!");

    return () => {
      socketRef.current.close();
    };
  }, [url, onMessage]);

  return socketRef.current;
};

export default useWebSocket;