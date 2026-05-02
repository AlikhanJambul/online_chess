package ws

import (
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log/slog"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // в проде поменять на проверку origin
	},
}

type WSHandler struct {
	hub        *Hub
	authClient *auth.Client
}

func NewWSHandler(hub *Hub, authClient *auth.Client) *WSHandler {
	return &WSHandler{hub: hub, authClient: authClient}
}

func (h *WSHandler) HandleConnection(c *gin.Context) {
	gameID := c.Param("id")

	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token required"})
		return
	}

	decoded, err := h.authClient.VerifyIDToken(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	uid := decoded.UID

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Error("ws upgrade error", "err", err)
		return
	}

	room := h.hub.GetOrCreateRoom(gameID)

	if room.Count() >= 2 {
		conn.WriteMessage(websocket.CloseMessage, []byte("room is full"))
		conn.Close()
		return
	}

	client := NewClient(uid, room, conn, h.hub)
	room.Join(client)

	go client.WritePump()
	go client.ReadPump()
}
