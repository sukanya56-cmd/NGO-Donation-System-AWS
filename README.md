# NGO Donation System – AWS

## Project Overview

The NGO Donation System is a web-based platform designed to connect NGOs with donors. It allows NGOs to share their requirements and enables donors to contribute towards social causes by donating money or essential items.

The project aims to make the donation process more accessible, organized and transparent through a simple and user-friendly interface.

## Objectives

- Connect NGOs and donors through a common platform.
- Allow NGOs to publish their donation requirements.
- Enable donors to view NGO requirements and contribute.
- Provide an organized system for managing donation information.
- Explore AWS cloud services for hosting, infrastructure and security.

## Main Modules

### 1. Home Page
- Introduction to the NGO Donation System.
- Display of available NGOs and their requirements.
- Donate Now option.

### 2. Donor Module
- View NGO donation requirements.
- Select donation opportunities.
- Submit donation details.

### 3. NGO Module
- NGO dashboard.
- Add and manage donation requirements.
- Share required items and financial assistance needs.

### 4. Admin Module
- Centralized administration of the platform.
- Management of platform information and records.

## Technology Stack

**Frontend**
- React.js
- Vite
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- JavaScript
- JSON-based local data storage

**Cloud Platform**
- Amazon Web Services (AWS)

## AWS Services and Security

The project includes an AWS deployment and security component covering:

- **Amazon S3:** Static website hosting.
- **Amazon VPC:** Network isolation and VPC peering.
- **Amazon EC2:** Cloud infrastructure and security group configuration.
- **AWS KMS:** Encryption key management for S3 data using SSE-KMS.
- **AWS CloudTrail:** Monitoring and auditing AWS account activity.
- **AWS IAM:** Identity and access management.

*Only describe a service as implemented when its configuration has actually been completed.*

## Project Structure

```text
NGO-Donation-System-AWS/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the project

```bash
cd NGO-Donation-System-AWS
```

### 3. Setup backend

```bash
cd backend
npm install
```

Configure your environment variables using `.env.example` as a reference. Never upload your actual `.env` file.

Start the backend using the start command configured in `backend/package.json`.

### 4. Setup frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Security Practices

- Sensitive environment files are excluded from Git.
- Private donation and user records should not be published.
- AWS access keys and credentials must never be stored in the repository.
- Generated files and dependencies are excluded using `.gitignore`.

## Future Enhancements

- Online payment gateway integration.
- Improved donation tracking.
- NGO verification system.
- Donor contribution history.
- Cloud-based database integration.
- Improved administrative dashboard.

## Project Purpose

This project was developed as an academic project to demonstrate web development, backend integration and practical exposure to AWS cloud infrastructure and security concepts.
