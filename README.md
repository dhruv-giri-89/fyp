# FYP - Online Voting System

A comprehensive online voting system with blockchain integration and modern web technologies.

## 🏗️ Project Structure

```
Fyp/
├── backend/                 # Node.js/Express API
│   ├── controllers/        # API controllers
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── config/            # Database and cloud config
│   ├── prisma/            # Database schema and migrations
│   └── scripts/           # Utility scripts
├── frontend/              # React.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── blockchain/            # Hardhat blockchain setup
│   ├── contracts/         # Solidity smart contracts
│   ├── scripts/           # Deployment and test scripts
│   └── artifacts/         # Compiled contract artifacts
└── docs/                  # Documentation
```

## 🚀 Features

### 🗳️ Voting System
- **Secure Authentication**: OTP-based voter authentication
- **Admin Dashboard**: Complete election and candidate management
- **Voter Dashboard**: View active elections and voting history
- **Real-time Results**: Live vote counting and statistics
- **Blockchain Integration**: Immutable vote records on Ethereum

### 🎨 Frontend Features
- **Modern UI/UX**: Responsive design with Tailwind CSS
- **Glass Morphism**: Beautiful frosted glass effects
- **Dark Theme**: Professional dark color scheme
- **Mobile Responsive**: Works on all devices
- **Smooth Animations**: Transitions and micro-interactions

### 🔧 Backend Features
- **RESTful API**: Well-structured API endpoints
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based secure authentication
- **File Upload**: Cloudinary integration for images
- **Validation**: Comprehensive input validation

### ⛓️ Blockchain Features
- **Smart Contract**: Secure voting logic on Ethereum
- **Vote Immutability**: Tamper-proof vote records
- **Transparency**: Publicly verifiable results
- **Decentralization**: No single point of failure

## 🛠️ Technologies Used

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File upload

### Blockchain
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **Ethers.js** - Ethereum library
- **Ethereum** - Blockchain platform

## 📋 Prerequisites

- **Node.js** (v18-20 recommended)
- **MySQL** database
- **Git** for version control
- **MetaMask** (for blockchain testing)

## 🚀 Quick Start

For a detailed, step-by-step setup guide for beginners, please refer to the **[SETUP.md](./SETUP.md)** file.

### 1. Clone the Repository
```bash
git clone https://github.com/dhruv-giri-89/fyp.git
cd fyp
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables in .env
npx prisma db push
npm run seed
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Blockchain Setup
```bash
cd blockchain
npm install --legacy-peer-deps
npx hardhat compile
npx hardhat node  # Keep this running
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL="mysql://username:password@localhost:3306/voter_db"
JWT_SECRET="your-jwt-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/send-otp` - Send OTP to voter
- `POST /api/auth/verify-otp` - Verify OTP and login

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard stats
- `CRUD /api/elections` - Election management
- `CRUD /api/parties` - Party management
- `CRUD /api/candidates` - Candidate management

### Voter Endpoints
- `GET /api/voter/profile` - Voter profile
- `GET /api/voter/elections/active` - Active elections
- `GET /api/voter/history` - Voting history
- `POST /api/voter/vote` - Cast vote

## 🗳️ Smart Contract Functions

### Voting Contract
- `addCandidate(string name)` - Add new candidate (admin only)
- `vote(uint candidateId)` - Cast vote
- `getVotes(uint candidateId)` - Get vote count
- `getAllCandidates()` - Get all candidates
- `hasUserVoted(address user)` - Check if user voted

## 🎯 Default Credentials

### Voter Login
- **Aadhaar**: `123456789012`
- **OTP**: `123456`

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

## 🌟 Features Showcase

### Admin Dashboard
- Create and manage elections
- Add parties and candidates
- Upload candidate photos
- View voting statistics
- Manage users

### Voter Dashboard
- View active elections
- Cast votes securely
- Check voting history
- View election results
- Profile management

### Blockchain Integration
- Immutable vote records
- Transparent result verification
- Decentralized vote counting
- Smart contract automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Hardhat team for blockchain development tools
- Prisma team for the excellent ORM
- Tailwind CSS for the utility-first CSS framework

## 📞 Contact

- **GitHub**: [@dhruv-giri-89](https://github.com/dhruv-giri-89)
- **Email**: [your-email@example.com]

---

⭐ If you find this project helpful, please give it a star!
