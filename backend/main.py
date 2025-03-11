from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from dotenv import load_dotenv
import openai
import random
import uvicorn
from PIL import Image, ImageStat

# Load environment variables
load_dotenv()

app = FastAPI(title="Waste Classification API")

# Configure CORS - allow requests from any frontend origin in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Development mode flag
DEV_MODE = True  # Set to True while model is not available

# Load the TensorFlow model (with better error handling)
MODEL_PATH = "models/waste_classification_model"
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
    DEV_MODE = False
except:
    print("Model not found. Running in development mode with smart classifications.")
    model = None

WASTE_CATEGORIES = ["recyclable", "organic", "hazardous", "landfill"]

def analyze_image_colors(image: Image.Image) -> dict:
    """Analyze the color distribution of an image."""
    # Convert to RGB if not already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Get image statistics
    stat = ImageStat.Stat(image)
    
    # Calculate average colors
    avg_color = tuple(int(x) for x in stat.mean)
    
    # Calculate brightness and color variance
    brightness = sum(avg_color) / 3
    is_bright = brightness > 200
    is_very_bright = brightness > 230
    
    # Check color characteristics
    is_bluish = avg_color[2] > avg_color[0] and avg_color[2] > avg_color[1]
    is_brownish = avg_color[0] > 100 and avg_color[1] > 80 and avg_color[2] < avg_color[0]
    
    # Calculate color variance (to detect solid colors vs patterns)
    extremes = stat.extrema
    color_variance = sum(max(x) - min(x) for x in extremes) / 3
    is_solid_color = color_variance < 50
    
    return {
        'is_bluish': is_bluish,
        'is_brownish': is_brownish,
        'is_bright': is_bright,
        'is_very_bright': is_very_bright,
        'is_solid_color': is_solid_color,
        'brightness': brightness,
        'avg_color': avg_color,
        'color_variance': color_variance
    }

def smart_classify(image: Image.Image) -> tuple[str, float]:
    """Perform basic image analysis to make educated guesses about waste type."""
    color_analysis = analyze_image_colors(image)
    
    # Paper detection (white/bright, solid color)
    if color_analysis['is_very_bright'] and color_analysis['is_solid_color']:
        return "recyclable", 0.92  # High confidence for white paper
    
    # Cardboard detection (brownish)
    if color_analysis['is_brownish']:
        return "recyclable", 0.85
    
    # Plastic bottles/clear containers (bluish or very bright)
    if color_analysis['is_bluish'] or (color_analysis['is_bright'] and not color_analysis['is_solid_color']):
        return "recyclable", 0.85
    
    # Dark or unusual colors might indicate hazardous materials
    if color_analysis['brightness'] < 60:
        return "hazardous", 0.70
    
    # If predominantly brown/green with high variance, might be organic
    avg_color = color_analysis['avg_color']
    if avg_color[1] > avg_color[0] and avg_color[1] > avg_color[2] and not color_analysis['is_solid_color']:
        return "organic", 0.75
    
    # Default to recyclable for light-colored items
    if color_analysis['is_bright']:
        return "recyclable", 0.75
    
    # For uncertain cases, use weighted random selection
    weights = [0.4, 0.3, 0.2, 0.1]  # Higher weight for recyclable and organic
    return random.choices(WASTE_CATEGORIES, weights=weights)[0], 0.65

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess the image for model prediction."""
    # Resize image to match model's expected input
    image = image.resize((224, 224))
    # Convert to array and normalize
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"status": "running", "mode": "development" if DEV_MODE else "production"}

@app.post("/api/classify")
async def classify_waste(file: UploadFile = File(...)):
    """Classify waste image using the AI model."""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    try:
        # Read and validate the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if DEV_MODE or model is None:
            # Development mode: use smart classification
            prediction, confidence = smart_classify(image)
        else:
            # Production mode: use actual model
            processed_image = preprocess_image(image)
            predictions = model.predict(processed_image)
            prediction = WASTE_CATEGORIES[np.argmax(predictions[0])]
            confidence = float(np.max(predictions[0]))

        # Get recommendations for the category
        recommendations = get_recommendations(prediction)
        
        return JSONResponse({
            "category": prediction.capitalize(),
            "confidence": round(confidence, 2),
            "recommendations": recommendations,
            "mode": "development" if DEV_MODE else "production"
        })
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_endpoint(query: str):
    """Handle chatbot queries about waste management."""
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        if DEV_MODE or not openai.api_key:
            # Development mode: return mock response
            responses = [
                "You can recycle this item in your local recycling bin.",
                "This type of waste should be composted.",
                "Please dispose of this item at a designated facility.",
                "Consider reducing waste by choosing reusable alternatives."
            ]
            return JSONResponse({
                "response": random.choice(responses),
                "mode": "development"
            })

        # Production mode: use actual OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful expert in waste management and environmental sustainability. Provide clear, concise answers about waste disposal, recycling, and eco-friendly alternatives."},
                {"role": "user", "content": query}
            ],
            max_tokens=150
        )
        return JSONResponse({
            "response": response.choices[0].message.content,
            "mode": "production"
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_recommendations(category: str) -> list:
    """Get disposal recommendations based on waste category."""
    recommendations = {
        "recyclable": [
            "Clean and dry the item before recycling",
            "Remove any non-recyclable parts",
            "Check local recycling guidelines",
            "Flatten boxes and containers to save space"
        ],
        "organic": [
            "Consider home composting",
            "Remove any non-biodegradable materials",
            "Use in garden if applicable",
            "Keep separate from other waste types"
        ],
        "hazardous": [
            "Do not dispose in regular trash",
            "Find local hazardous waste disposal facility",
            "Store safely until proper disposal",
            "Never mix with other waste types"
        ],
        "landfill": [
            "Consider if item can be reused or repaired",
            "Remove any recyclable components",
            "Place in general waste bin",
            "Try to reduce similar waste in future"
        ]
    }
    return recommendations.get(category.lower(), [
        "Check local waste management guidelines",
        "Consider ways to reduce similar waste",
        "When in doubt, contact local authorities"
    ])

if __name__ == "__main__":
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug") 