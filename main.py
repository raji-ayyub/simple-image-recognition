"""
FastAPI server for water bottle image recognition
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import uvicorn
from predict import WaterBottleClassifier

app = FastAPI(
    title="Water Bottle Classifier API",
    description="A simple API to classify if an image contains a water bottle",
    version="1.0.0"
)

# Initialize classifier (will load model when first prediction is made)
classifier = None

def get_classifier():
    """Lazy load the classifier"""
    global classifier
    if classifier is None:
        try:
            classifier = WaterBottleClassifier('water_bottle_model.h5')
            print("Model loaded successfully")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load model. Please train the model first. Error: {str(e)}"
            )
    return classifier

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Water Bottle Classifier API",
        "endpoints": {
            "GET /": "This information",
            "POST /predict": "Upload an image to classify",
            "GET /health": "Check API health"
        },
        "instructions": "Upload an image to /predict to check if it contains a water bottle"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": classifier is not None}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """
    Predict if uploaded image contains a water bottle
    
    Args:
        file: Image file (JPEG, PNG, etc.)
    
    Returns:
        Prediction results with confidence
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )
    
    try:
        # Read image file
        contents = await file.read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Get classifier and make prediction
        classifier = get_classifier()
        result = classifier.predict(image)
        
        # Format response
        response = {
            "filename": file.filename,
            "prediction": result['class'],
            "confidence": round(result['confidence'] * 100, 2),
            "is_water_bottle": result['is_water_bottle'],
            "message": f"This image contains a {result['class'].replace('_', ' ')} with {round(result['confidence'] * 100, 2)}% certainty."
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@app.post("/predict-batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    """
    Predict multiple images at once
    
    Args:
        files: List of image files
    
    Returns:
        List of predictions for each image
    """
    results = []
    classifier = get_classifier()
    
    for file in files:
        if not file.content_type.startswith('image/'):
            continue  # Skip non-image files
        
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            result = classifier.predict(image)
            
            results.append({
                "filename": file.filename,
                "prediction": result['class'],
                "confidence": round(result['confidence'] * 100, 2),
                "is_water_bottle": result['is_water_bottle']
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"predictions": results}

if __name__ == "__main__":
    print("Starting Water Bottle Classifier API...")
    print("\nAccess the API at: http://localhost:8000")
    print("API Documentation at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)