# AI-Powered Waste Classification & Chatbot

An intelligent web application for waste classification and sustainable waste management guidance.

## Features

- 🤖 AI-powered waste image classification (recyclable, organic, hazardous)
- 💬 Interactive chatbot for waste disposal queries
- 📱 Responsive web interface
- ✨ Real-time classification results
- 🌱 Eco-friendly disposal suggestions

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Axios for API communication

### Backend
- FastAPI
- Python 3.9+
- TensorFlow for image classification
- PostgreSQL for data storage
- OpenAI API for chatbot functionality

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.9+
- PostgreSQL
- OpenAI API key

### Installation

1. Clone the repository
2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

4. Set up environment variables:
Create `.env` files in both frontend and backend directories with the necessary configuration.

## Project Structure

```
waste/
├── frontend/           # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # FastAPI backend application
│   ├── app/
│   ├── models/
│   └── requirements.txt
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 