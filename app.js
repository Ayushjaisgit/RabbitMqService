const express = require("express");
const amqp = require("amqplib");
const app = express();
const port = 3002;
require('dotenv').config()

const rabbitMQServer = process.env.SERVER_LINK;
const queueName = "mediaCompression";

async function setupRabbitMQConsumer() {
  try {
    const connection = await amqp.connect(rabbitMQServer);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    // consumer to process incoming messages
    channel.consume(queueName, (message) => {
      const jsonData = JSON.parse(message.content.toString());

      console.log("Received JSON data:", jsonData );
      // let response = processImage(jsonData.media[0]);

      // Acknowledging the message to remove it from the queue
      channel.ack(message);
    });

    console.log("RabbitMQ consumer is listening...");
  } catch (error) {
    console.log("Error setting up RabbitMQ consumer:", error);
  }
}

// Start the Express application and set up RabbitMQ consumer
app.listen(port, async () => {
  console.log(`Express server is running on http://localhost:${port}`);
  await setupRabbitMQConsumer();
});

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
