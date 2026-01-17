# BuzzBoard 🚀

> **Connect, Create, Lead. The all-in-one clubs and event platform.**

BuzzBoard is a comprehensive full-stack application built with the **MERN** (MongoDB, Express.js, React.js, Node.js) stack. It serves as a centralized hub for managing university or community clubs, organizing events, and coordinating members and volunteers.

## ✨ Key Features

* **User Authentication:** Secure sign-up and login functionality for users.
* **Club Management:** Users can discover, create, and join clubs.
* **Event Management:** Admins can create and manage events, including details like location, date, and description.
* **Admin Dashboard:** A powerful control panel for admins to get an overview of the community.
* **Member Management:** Admins can view and manage all members associated with specific clubs.
* **Request & Volunteer Management:** Systems for approving new member requests and managing event volunteers.
* **User Profiles:** Users can view and edit their personal information.

## 🛠️ Tech Stack

* **MongoDB:** NoSQL database to store all user, club, event, and volunteer data.
* **Express.js:** Back-end framework for building robust and scalable RESTful APIs.
* **React.js:** Front-end library for building a dynamic and responsive user interface.
* **Node.js:** JavaScript runtime environment for the server-side logic.

## 📸 Project Showcase

Here is a walkthrough of the BuzzBoard platform, from landing to the admin panel.

### 1. Landing Page
The first-look page for all visitors, introducing the platform's purpose.

![Image](https://github.com/user-attachments/assets/2bef320f-7d32-4477-bb60-3ad32aeb33e3)


---

### 2. Authentication
Secure sign-up and login for all users.

#### Sign Up Page
New users can create an account with their name, email, and password.

![Image](https://github.com/user-attachments/assets/75ff973c-a05e-4983-b2e3-f4991cb4657a)


#### Log In Page
Registered users can access their accounts.

![Image](https://github.com/user-attachments/assets/5959b47a-f888-45ac-a8d2-e15803663d50)

---

### 3. User Dashboard & Features
Once logged in, users can interact with the community.

#### Clubs Page
Users can see a list of available clubs, join them, or create their own.

![Image](https://github.com/user-attachments/assets/93d1bec7-a6c2-4d4c-865c-46ed7c99befb)

#### User Profile Page
Users can view and manage their personal profile details.

![Image](https://github.com/user-attachments/assets/0b4a890b-8096-49a3-97aa-aa86d42863b0)

---

### 4. Admin Panel
A dedicated dashboard for club organizers and administrators to manage the entire platform.

#### Admin Overview
The main dashboard displays key statistics like total events, clubs, pending requests, and volunteers. It also shows recent event activity and new applicants.

![Image](https://github.com/user-attachments/assets/3c19e175-351b-4f92-a913-28f176b4dc00)

#### Manage Events
Admins can create new events using this detailed form.

![Image](https://github.com/user-attachments/assets/a885f78b-9ea8-4bf9-80d4-27c4aba8f203)


#### Manage Members
Admins can filter by club to see a detailed list of all current members.

![Image](https://github.com/user-attachments/assets/a9defa52-f4f3-45c9-992c-c131504f1aed)

#### Manage Volunteers
This panel shows a list of all users who have signed up to volunteer for events.

![Image](https://github.com/user-attachments/assets/166263b9-e615-4ae1-ac8c-f72f85894834)

#### Manage Join Requests
Admins can approve or deny pending requests from users wanting to join clubs.

![Image](https://github.com/user-attachments/assets/80c56002-6bc3-40b4-aedf-200554809c74)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* npm (or yarn)
* MongoDB (local installation or a MongoDB Atlas connection string)

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/Withdivyansh/buzzboard.git](https://github.com/Withdivyansh/buzzboard.git)
    cd buzzboard
    ```

2.  **Install Server Dependencies**
    ```sh
    cd server
    npm install
    ```
    *Create a `.env` file and add your `MONGO_URI` and `JWT_SECRET`.*

3.  **Install Client Dependencies**
    ```sh
    cd ../client
    npm install
    ```

4.  **Run the Application**
    * Run the server: `cd server && npm start`
    * Run the client: `cd client && npm start`
