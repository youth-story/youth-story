const expressWs = require("express-ws")
const Message = require("../models/message")
const mongoose = require("mongoose")

module.exports = function (app) {
  const appWs = expressWs(app)

  const connectedClients = {} // Store connected clients and their respective rooms

  app.ws("/ws", async (ws, req) => {
    console.log("WebSocket connected")

    const { user, room } = req.query

    if (!user || !room) {
      // Close the WebSocket connection if user or room is missing
      ws.close()
      return
    }

    // Add the connected WebSocket to the list of connected clients
    if (!connectedClients[room]) {
      connectedClients[room] = []
    }
    connectedClients[room].push({ ws, user })

    try {
      const messages = await Message.find({
        room: room,
      })

      // Mark unread messages as read for the connecting user
      await Message.updateMany(
        {
          room: room,
          user: { $ne: user }, // Exclude current user's messages
          isRead: false,
        },
        { $set: { isRead: true } }
      )

      // Send existing messages to the connected client
      if (messages.length > 0) {
        ws.send(
          JSON.stringify(
            messages.map((msg) => ({
              user: msg.user,
              room: msg.room,
              text: msg.text,
              isRead: msg.isRead,
            }))
          )
        )
      } else {
        ws.send(JSON.stringify("No messages yet."))
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }

    // Handle messages from the client
    ws.on("message", async (msg) => {
      console.log("Received message:", msg)

      // Broadcast the message to all connected clients in the same room
      if (connectedClients[room]) {
        const newMessage = new Message({
          room: room,
          user: mongoose.Types.ObjectId(user), // Convert user to ObjectId
          text: msg,
          isRead: true,
        })

        await newMessage.save()

        connectedClients[room].forEach(async (client) => {
          if (client.ws !== ws) {
            client.ws.send(
              JSON.stringify({
                user: user,
                room: room,
                text: msg,
                isRead: true,
              })
            )
          }
        })
      }
    })

    // Handle WebSocket close event
    ws.on("close", () => {
      console.log("WebSocket disconnected")

      // Remove the WebSocket from the list of connected clients
      if (connectedClients[room]) {
        connectedClients[room] = connectedClients[room].filter(
          (client) => client.ws !== ws
        )
      }
    })
  })
}
