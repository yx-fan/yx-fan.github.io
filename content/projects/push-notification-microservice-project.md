---
title: "Push Notification Microservice"
date: 2024-10-05
summary: "A gRPC-based push notification microservice."
tags:
  [
    "gRPC",
    "Microservices",
    "Node.js",
    "TypeScript",
    "Docker",
    "Push Notifications",
  ]
image: "/images/Microservice.png" # 项目图片路径
---

# Push Notification Microservice

## Overview

The **Push Notification Microservice** is a project I developed to handle the complexities of sending push notifications to different platforms, such as iOS and Android, using multiple providers. The service is built with **Node.js** and **gRPC**, enabling it to efficiently send notifications based on the platform and region.

Additionally, the project includes **grpcui**, a web-based UI that allows developers to interact with the gRPC service directly through a browser. This service is designed to be scalable and easily extendable, allowing integration with new notification providers in the future.

## System Architecture

This microservice integrates with various platforms using different notification providers (such as Firebase for Android and APNs for iOS). The architecture is designed to select the appropriate provider based on the platform and region of the recipient.

Below are sequence diagrams that illustrate the internal and system-level flows of the notification process.

### Internal Sequence Diagram

The internal sequence diagram outlines the core logic within the **Notification Service**. When a notification request is received, the system fetches the token, platform, and region, selects the appropriate notification provider, and sends the notification.

![Push_Notification_Service_Internal_Sequence_Diagram](/images/Push_Notification_Service_Internal_Sequence_Diagram.png)

### System Sequence Diagram

The system sequence diagram shows how different components of the microservice, such as the **Chat Backend** and **Mobile App Frontend**, interact with the push notification service. The diagram demonstrates how tokens and regions are passed from the mobile app to the backend, which stores the data and sends it to the **Push Notification Service**.

![Push_Notification_System_Sequence_Diagra](/images/Push_Notification_System_Sequence_Diagram.png)

## Features

- **Platform-Agnostic Notifications**: The service supports sending notifications to both iOS and Android platforms using Firebase or APNs, with the flexibility to add more providers.
- **gRPC-Based Communication**: The use of gRPC allows for high performance, strong typing, and efficient communication between services.
- **grpcui Integration**: A web-based UI for easily interacting with and testing the gRPC server.
- **Scalable Design**: The architecture is designed to scale horizontally and allows for easy addition of new notification providers or features.

## Project Structure

Here is a brief overview of the project structure:

```bash
push-notification-microservice/
│
├── .github/                # GitHub workflows for CI/CD
│   └── workflows/
│       └── release-notification.yml
├── docker.example/         # Example Docker setup for development
├── docs/                   # Documentation and diagrams
├── src/                    # Source code
│   ├── api/v1/             # gRPC API definitions
│   │   ├── generated/      # Generated TypeScript code from proto files
│   │   └── notification.proto  # Protobuf file for push notification service
│   ├── config/             # Configuration files
│   ├── controllers/        # Controllers for handling requests
│   ├── providers/          # Providers for Firebase, APNs, etc.
│   ├── services/           # Core business logic
│   ├── utils/              # Utility functions (error handling, logging)
│   ├── app.ts              # Express app setup
│   └── grpcServer.ts       # gRPC server setup
└── test/                   # Unit and integration tests
```

## Technologies Used

- **Node.js**: The core framework used for building the backend of the microservice.
- **TypeScript**: Ensures type safety throughout the project.
- **gRPC**: Used for communication between services.
- **Firebase**: A provider for sending notifications to Android devices.
- **APNs**: A provider for sending notifications to iOS devices.
- **Docker**: The service is containerized using Docker for easy deployment.

## Development Process

Throughout the development process, my goal was to create a flexible and scalable solution that can handle notifications for multiple platforms in different regions. The microservice architecture was chosen to allow for easy scaling and integration of new notification providers.

The use of gRPC offers several advantages, including efficient communication between services and the ability to strictly define APIs using Protobuf.

I also implemented **grpcui** to provide an easy-to-use web interface for testing and interacting with the gRPC service. This has been invaluable during the testing phase.

## Diagrams

I created detailed sequence diagrams to help visualize the internal flow and system-level interactions of the microservice. These diagrams have been crucial in understanding how different components communicate with each other, and they helped guide the development process.

You can view the diagrams above in the **System Architecture** section.

## Conclusion

The **Push Notification Microservice** was developed as part of a broader system for handling notifications across platforms and regions. It is a flexible, scalable solution that leverages the power of gRPC and supports multiple providers. In the future, I plan to extend this project by adding more notification providers and further optimizing performance.

For more projects and updates, visit my [GitHub profile](https://github.com/yx-fan/push-notification-microservice).
