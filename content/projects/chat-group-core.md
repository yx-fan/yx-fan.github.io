---
title: "Group Chat Architecture and Implementation"
date: 2024-10-20
tags:
  [
    "chat",
    "System Design",
    "Real-time Messaging",
    "Node.js",
    "MongoDB",
    "Message Queue",
    "Web Socket",
    "Web3",
    "gRPC",
  ]
image: "/images/System_Design.png"
summary: "An in-depth exploration of the architecture and implementation of a group chat system, covering group creation, subscription, real-time messaging, and gRPC-based communication between microservices."
---

In this article, I’ll walk through the architecture and implementation details of a **Group Chat System**. This system allows users to create groups, send and receive messages in real-time, and ensures message delivery even when users are offline. The architecture leverages **message queues** and **gRPC-based microservices** for efficient, reliable communication between the backend services, ensuring seamless interactions. Below, I’ll explore both the group creation process and the messaging flow using detailed sequence charts to illustrate each step.

---

## 1. Group Creation and Subscription

This section explores how users create groups and subscribe to receive group messages. The flow covers creating a group, notifying group members, and managing online and offline statuses for group message delivery.

### Sequence Flow

Here’s the step-by-step sequence for creating a group and subscribing members:

1. **Group Creation via API**  
   User A sends a POST request to create a group. This request is processed by the backend, which stores group details in the database. The user's JWT token is verified before creating the group. A dedicated function is used to handle group creation notifications to ensure group members are informed.

2. **notify_create_group Event**  
   Once the group is successfully created via the API, the **notify_create_group** event is sent from the client to the backend. This event signals the backend to notify the relevant group members that the group has been created. A backend function processes this request and sends an **a_group_created** message to the relevant group members directly via their WebSocket connection.

   - **Direct Message Sending**: The backend sends notifications directly to the front-ends of the group members via WebSockets, bypassing the message queue system.

3. **Member Subscription**  
   After receiving the notification, each group member subscribes to the group topic using the **subscribe_to_group** event. This event is processed by a function designed to ensure that the member is successfully subscribed to the group's messages.

4. **Handling Offline Members**  
   If a member is offline during group creation, the notification is stored, and they will receive it upon reconnection. The system ensures that group members are subscribed as soon as they reconnect.

---

## 2. Group Chat for Text Messages

Once a group is created and members are subscribed, the system enables real-time messaging between group members. The flow includes sending, receiving, and acknowledging group messages, and handling offline members.

### Sequence Flow

1. **User Authentication**  
   Users authenticate via JWT tokens to establish a secure WebSocket connection. A function is responsible for handling the connection, verifying user credentials, and connecting them to the group chat system.

2. **send_group_message Event**  
   Users send messages to the group via the **send_group_message** event. A backend function validates, encrypts, and stores the message in the database. After saving the message, the system uses a message queue to publish it to the group topic.

3. **Message Delivery**  
   Once the message is published to the group topic, it is delivered to all online group members in real-time. For offline users, the message is stored for delivery when they reconnect. Each group member acknowledges receiving the message using the **acknowledge_group_message** event.

   - **acknowledge_group_message Event**: After receiving a message, each member sends an acknowledgment back to the server. A backend function processes these acknowledgments, updating the message's status to "read."

4. **Error Handling and Rollback**  
   If an error occurs during the message-sending process, the system emits an error event to the sender. If the message has been stored but not fully processed, a rollback mechanism is used to revert any changes to the message status in the database.

---

## 3. Group Chat for Non-Text Messages (Media)

For sending media (such as images or videos) in a group chat, the process involves uploading files to cloud storage before sending the message.

### Sequence Flow

1. **Request Pre-signed URL**  
   Users request a pre-signed URL for media uploads from the backend. This request is processed by a backend function that generates an upload URL for AWS S3 and returns it to the user.

2. **Upload Media to Cloud**  
   Users upload media files to AWS S3 using the pre-signed URL. Once the upload is complete, they send the media URL to the group via the **send_group_message** event. The media URL is treated like other message content and stored in the database.

3. **Media Message Delivery**  
   After the media message is sent and stored, it is delivered to the group members in real-time. Online members receive the media URL immediately, while offline members will receive it when they reconnect.

4. **Handling Errors**  
   If an error occurs during the media upload or message sending process, an error event is emitted to the user, and the message status is rolled back if necessary.

---

## 4. Data Model Design

The system's data model is designed to store information about groups, messages, and their statuses efficiently. Here’s a breakdown of the key models used:

1. **Group Model**

   - The **Group** model defines the structure of a chat group, including its name, description, members, and metadata (such as who created the group and when). Each group can have multiple members, and member information is stored with a reference to a `UserProfile`. A group also tracks who the current owner is, allowing for ownership transfers.
   - **Members**: The list of members is stored as an array within the group schema. Each member contains the user ID (referencing the `UserProfile`) and a `joinedAt` timestamp, indicating when the member joined the group.

2. **GroupMessage Model**

   - The **GroupMessage** model stores individual messages sent within a group. Each message is associated with a group and a sender (both referencing the respective `Group` and `UserProfile` models). Messages can either be text-based or media-based, with fields for both text content and media URLs.
   - **Types of Messages**: The message type is defined with an enum that supports 'text', 'image', 'video', and 'audio'. The model also tracks when the message was created and last updated.

3. **GroupMessageStatus Model**
   - The **GroupMessageStatus** model is designed to track the delivery and read statuses of messages for each group member. This allows the system to know which users have received and read each message. It references both the `GroupMessage` and `UserProfile` models to associate status updates with specific messages and users.
   - **Delivered and Read Flags**: The model includes `delivered` and `read` boolean flags to track whether a message has been delivered and/or read by the user. The `updatedAt` field allows the system to keep track of when these statuses were last modified.

---

## Conclusion

This architecture outlines how group chat works for both text and media messages in a real-time, secure environment. By leveraging **WebSocket connections**, **gRPC-based microservices**, and **message queues**, the system efficiently handles message delivery and ensures reliability for both online and offline users. The sequence charts illustrate the key WebSocket events like **notify_create_group**, **send_group_message**, **subscribe_to_group**, and **acknowledge_group_message**, which form the backbone of the group chat's functionality. The data model design ensures that group information, messages, and statuses are stored efficiently, providing the necessary structure to support real-time communication.
