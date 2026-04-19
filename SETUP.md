# Project Setup Guide

This guide provides step-by-step instructions to set up the Online Voting System on your local machine.

## Prerequisites

Ensure you have the following installed:
- **Node.js**: (v18.x or v20.x recommended) - [Download](https://nodejs.org/)
- **MySQL**: (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/installer/)
- **Git**: For version control - [Download](https://git-scm.com/)
- **MetaMask**: Browser extension for blockchain interaction - [Download](https://metamask.io/)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/dhruv-giri-89/fyp.git
cd fyp
```

---

## Step 2: Backend Configuration

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory by copying the example:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in the following:

   | Variable | Description | Where to get it |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | MySQL connection string | `mysql://root:PASSWORD@localhost:3306/voter_db` (Replace PASSWORD with your MySQL root password) |
   | `JWT_SECRET` | Secret key for Voter tokens | Any long random string (e.g., `VotingAppSecret123`) |
   | `ADMIN_JWT_SECRET` | Secret key for Admin tokens | A different random string |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary Name | Create a free account at [Cloudinary](https://cloudinary.com/), find it in Dashboard |
   | `CLOUDINARY_API_KEY` | Cloudinary API Key | Found in your Cloudinary Dashboard |
   | `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Found in your Cloudinary Dashboard |

4. **Initialize Database**:
   Ensure MySQL is running, then run:
   ```bash
   npx prisma db push
   npm run seed
   ```

5. **Start Backend**:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5001`.

---

## Step 3: Blockchain Setup (Hardhat)

1. **Navigate to the blockchain folder**:
   ```bash
   cd ../blockchain
   ```
2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Run a local Ethereum node**:
   ```bash
   npx hardhat node
   ```
   **IMPORTANT**: Keep this terminal open and running.
4. **Deploy the Smart Contract**:
   In a **new** terminal, navigate back to the `blockchain/` folder and run:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Copy the **Contract Address** printed in the console (e.g., `0x5Fb...`).
5. **Configure Frontend with Address**:
   Go to `frontend/src/pages/Vote.jsx` and `Results.jsx` and update the `CONTRACT_ADDRESS` constant if it changed.

---

## Step 4: Frontend Configuration

1. **Navigate to the frontend folder**:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## Step 5: Connecting MetaMask

1. Open MetaMask and add a **Custom Network**:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
2. **Import an Account**:
   Copy one of the **Private Keys** printed in your Hardhat Node terminal (Step 3.3) and import it into MetaMask to have test ETH.

---

## Troubleshooting

- **Prisma Error**: Ensure your MySQL `DATABASE_URL` is correct and the `voter_db` database exists or Prisma has permission to create it.
- **CORS Error**: Ensure both backend and frontend are running on their correct ports (5001 and 5173).
- **MetaMask Transaction Failure**: Reset your MetaMask account activity (Settings > Advanced > Clear Activity Tab data) if you restart the Hardhat node.
