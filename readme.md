# 🚀 Employee RAG System - AI-Powered HR Assistant

An intelligent Employee Management System with RAG (Retrieval-Augmented Generation) capabilities that provides natural language querying, employee CRUD operations, and AI-powered analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Usage](#frontend-usage)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Employee RAG System is a full-stack application that combines traditional CRUD operations with AI-powered natural language querying. It uses vector embeddings and semantic search to intelligently retrieve employee information and generate human-like responses to queries.

### How It Works

1. **Employee data** is stored in MongoDB with vector embeddings
2. **User queries** are converted to embeddings using Hugging Face models
3. **Vector search** finds semantically similar employee records
4. **AI generates** contextual responses based on retrieved information

## ✨ Features

### Backend Features

- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete employees
- ✅ **RAG-Powered Q&A** - Natural language querying with contextual responses
- ✅ **Vector Search** - Semantic search using embeddings
- ✅ **Keyword Search** - Traditional text-based search fallback
- ✅ **Analytics Dashboard** - Statistics and insights about employees
- ✅ **RESTful API** - Well-documented API endpoints
- ✅ **MongoDB Integration** - Scalable database with vector search support

### Frontend Features

- 💬 **AI Chat Interface** - Natural conversation with HR assistant
- 👥 **Employee Directory** - Grid view with search and filters
- 📊 **Analytics Dashboard** - Visual insights and statistics
- ➕ **Employee Forms** - Create/Edit employees with skill management
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Tailwind CSS with beautiful gradients and animations

## 🛠️ Tech Stack

### Backend

| Technology              | Version | Purpose                           |
| ----------------------- | ------- | --------------------------------- |
| Node.js                 | 18+     | Runtime environment               |
| Express.js              | 5.x     | Web framework                     |
| MongoDB                 | 6.x     | Database                          |
| MongoDB Atlas           | -       | Cloud database with vector search |
| Hugging Face API        | -       | Embeddings & LLM                  |
| Mongoose/MongoDB Driver | 6.x     | Database ODM                      |

### Frontend

| Technology      | Version | Purpose            |
| --------------- | ------- | ------------------ |
| React           | 18.x    | UI framework       |
| TypeScript      | 5.x     | Type safety        |
| Vite            | 5.x     | Build tool         |
| Tailwind CSS    | 3.x     | Styling            |
| Axios           | 1.x     | HTTP client        |
| Lucide React    | -       | Icons              |
| React Hot Toast | -       | Notifications      |
| React Markdown  | -       | Markdown rendering |
