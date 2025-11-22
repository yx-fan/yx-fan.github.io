---
title: "Travel Expense Tracker Backend System"
date: 2024-10-10
draft: false
summary: "A modular backend system for managing travel expenses, built with Node.js and Express, featuring microservices, message queues, and integration with third-party APIs."
tags:
  [
    "Node.js",
    "Express.js",
    "MongoDB",
    "RabbitMQ",
    "OCR",
    "RESTAPI",
    "System Design",
    "JWT",
    "AWS",
  ]
image: "/images/TravelExpense.png"
---

## Overview

The **Travel Expense Tracker Backend System** is a robust backend infrastructure designed to handle the complexities of managing travel expenses. The system architecture emphasizes **modularity**, **scalability**, and **performance optimization**. Built on **Node.js** and **Express**, it is designed to efficiently manage large volumes of user and expense data while ensuring a clean, maintainable structure.

![System Architecture](/images/Travel-expense-architecture.png)

---

## System Design Principles

### 1. Modularity and Separation of Concerns

The system follows a **modular architecture** that separates core functionalities into distinct, reusable components. This modularity is achieved by dividing the system into multiple services, each responsible for specific operations:

- **User Management Service**: Handles user registration, authentication, and profile updates.
- **Trip Service**: Manages all operations related to trip creation, updating, and deletion.
- **Expense Service**: Handles expense-related actions, such as adding and modifying expenses, and ties them to their respective trips.
- **Notification Service**: Manages in-app notifications, allowing the system to send alerts to users without impacting other services.

This **Separation of Concerns** ensures that each service focuses on a single responsibility, making the system easier to maintain and extend over time. For example, changes in the notification service won’t affect the trip or expense services, allowing for independent scaling and updates.

### 2. Scalability and Performance Optimization

The system is designed with scalability in mind, ensuring that it can handle increasing numbers of users and data without degradation in performance. The following strategies are implemented to achieve this:

- **Asynchronous Task Processing**: By using **RabbitMQ** as a message queue system, the backend offloads resource-heavy tasks like receipt OCR processing to a background service. This ensures that the main application remains responsive while long-running tasks are handled asynchronously.
- **Database Efficiency**: **MongoDB** is used as the database due to its flexible schema design and ability to handle large-scale data efficiently. Indexing and schema design (as seen in the `Expense` and `Trip` models) ensure that queries are optimized for performance, even when dealing with a high volume of expense and trip data.

- **Load Distribution**: Using cloud infrastructure (e.g., **AWS**), the system is designed to scale horizontally. As demand increases, additional instances of the backend can be deployed, distributing load across multiple servers to maintain responsiveness.

### 3. API Design and Integration

The backend exposes a well-structured **RESTful API** that allows the frontend (both iOS and Android) to interact with the system seamlessly. The API design follows a **resource-based** approach, where each endpoint corresponds to a specific resource (e.g., `/api/v1/expenses`, `/api/v1/trips`).

Key API design principles include:

- **Consistency**: All APIs follow consistent naming conventions and response structures, making them intuitive for developers and easy to document using **Swagger**.
- **Security**: **JWT** (JSON Web Tokens) is used for secure user authentication, ensuring that only authorized users can access sensitive data. Middleware is employed to validate tokens and ensure that unauthorized access is blocked at the gateway.
- **Scalability**: The API is designed to handle high volumes of requests efficiently, with endpoints optimized for both read-heavy and write-heavy operations.

### 4. Middleware and Cross-Cutting Concerns

Middleware plays a vital role in ensuring the backend is both secure and performant. The system integrates various middleware components to handle cross-cutting concerns:

- **Error Handling**: A global error handler catches exceptions and returns standardized error responses, ensuring that the system can recover gracefully from unexpected failures.
- **Authentication Middleware**: **Passport-JWT** is used to manage user sessions and ensure that protected routes can only be accessed by authenticated users.
- **File Upload Management**: **Multer** is used for handling file uploads (e.g., receipt images), allowing users to upload multiple files in a secure and efficient manner. This is especially important given the large size of receipt images that need to be processed by the OCR service.

---

## Performance Bottleneck: Optimizing OCR Request Handling with RabbitMQ

One of the significant challenges faced during the development of the Travel Expense Tracker system was handling **large volumes of OCR requests** efficiently. As the system allows users to upload multiple receipts, the process of converting these images into structured data (such as merchant name, date, and amount) using OCR can be resource-intensive and time-consuming.

### Problem

Initially, the backend was designed to process OCR requests synchronously—meaning that every time a user uploaded a receipt, the system would immediately attempt to process the image and extract data. This led to several issues:

- **Increased Latency**: As the number of users increased, so did the number of simultaneous OCR requests. Processing these requests in real time led to increased latency, causing delays in response times for users.
- **Server Overload**: The high computational load of OCR processing put a strain on the backend, especially when multiple users uploaded large images simultaneously. This not only slowed down the system but also increased the risk of server crashes.

### Solution: Asynchronous Processing with RabbitMQ

To address this bottleneck, we implemented **RabbitMQ** for **asynchronous task processing**. The core idea is to decouple the OCR processing from the main request flow. Instead of processing OCR requests synchronously, we offload them to a **background worker** using RabbitMQ. Here’s how it works:

1. **Receipt Upload**: When a user uploads a receipt, the backend immediately accepts the request and saves the receipt image, returning a success response to the user.
2. **Message Queue**: The system then places a message on a RabbitMQ queue, indicating that an OCR task needs to be performed. This allows the main application to continue handling other user requests without being blocked by the OCR task.
3. **Background Worker**: A separate background worker consumes messages from the queue and processes the OCR tasks asynchronously. This worker can be scaled horizontally to handle large volumes of OCR requests.
4. **Notification**: Once the OCR task is complete, the worker updates the database and triggers a notification to inform the user that their receipt has been processed.

### Benefits

- **Improved Performance**: By moving OCR tasks to the background, the system remains responsive to user actions, as it no longer has to wait for the OCR process to complete.
- **Scalability**: RabbitMQ allows us to scale the background worker independently. As the number of OCR requests increases, we can add more workers to process tasks in parallel.
- **Reduced Server Load**: By offloading resource-heavy tasks to background workers, the main backend servers experience reduced load, improving the overall stability and performance of the system.

---

## Key Technologies

The following technologies are central to the Travel Expense Tracker Backend System:

- **Node.js**: The backend is built on Node.js, providing a lightweight and efficient environment for handling multiple concurrent requests.
- **Express**: The web framework used for routing and API management, known for its minimalistic approach and flexibility.
- **Mongoose & MongoDB**: For schema-based modeling of the data, ensuring flexibility in handling complex data relationships such as users, trips, and expenses.
- **JWT (JSON Web Token)**: Secure authentication to protect user data and ensure safe API access.
- **RabbitMQ**: As a message broker, RabbitMQ handles asynchronous tasks, decoupling time-intensive processes from the core system and improving overall performance.

---

## Conclusion

The **Travel Expense Tracker Backend System** leverages modern design principles, including modularity, scalability, and performance optimization. By employing well-defined APIs, asynchronous task handling with RabbitMQ, and robust middleware, the system is designed to handle the challenges of managing travel expenses at scale, ensuring a seamless user experience across platforms.

If you’re interested in the technical implementation, feel free to check out the project on [GitHub](https://github.com/yx-fan/TravelExpenseTrackerServer). This project is open-source and contributions are welcome.
