const wsUrl = import.meta.env.VITE_WS_URL ?? "/ws";
const topicPrefix = import.meta.env.VITE_WS_TOPIC_PREFIX ?? "/topic/shipments";

function createTopic(shipmentId) {
  return `${topicPrefix}/${shipmentId}`;
}

export function createShipmentTrackingSocket({
  shipmentId,
  token,
  onMessage,
  onConnectionStateChange,
  onError,
}) {
  let closedManually = false;
  let client = null;

  const setupSocket = async () => {
    try {
      const stompModule = await import("@stomp/stompjs");
      const sockJsModule = await import("sockjs-client");
      const Client = stompModule.Client;
      const SockJS = sockJsModule.default;

      if (closedManually) {
        return;
      }

      client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 4000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        beforeConnect: () => {
          onConnectionStateChange?.("connecting");
        },
        onConnect: () => {
          onConnectionStateChange?.("connected");
          client.subscribe(createTopic(shipmentId), (frame) => {
            try {
              const payload = JSON.parse(frame.body);
              onMessage?.(payload);
            } catch {
              onError?.("Received an unreadable live tracking payload.");
            }
          });
        },
        onStompError: (frame) => {
          const message = frame.headers?.message ?? "Live tracking broker error.";
          onConnectionStateChange?.("error");
          onError?.(message);
        },
        onWebSocketClose: () => {
          if (!closedManually) {
            onConnectionStateChange?.("reconnecting");
          }
        },
        onWebSocketError: () => {
          onConnectionStateChange?.("error");
          onError?.("WebSocket connection error.");
        },
      });

      client.activate();
    } catch {
      onConnectionStateChange?.("error");
      onError?.("Live tracking is unavailable in this browser session.");
    }
  };

  setupSocket();

  return {
    disconnect: async () => {
      closedManually = true;
      onConnectionStateChange?.("disconnected");
      if (client) {
        await client.deactivate();
      }
    },
  };
}
