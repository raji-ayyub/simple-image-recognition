"""
Functions for making predictions with the trained model
"""
import numpy as np
import tensorflow as tf
from PIL import Image
import io

class WaterBottleClassifier:
    def __init__(self, model_path='water_bottle_model.h5'):
        """
        Initialize the classifier with a trained model
        
        Args:
            model_path: Path to the saved Keras model
        """
        self.model = tf.keras.models.load_model(model_path)
        self.image_size = (128, 128)  # Must match training size
        
    def preprocess_image(self, image):
        """
        Preprocess image for model prediction
        
        Args:
            image: PIL Image object or file-like object
        
        Returns:
            Preprocessed image as numpy array
        """
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to match model input
        image = image.resize(self.image_size)
        
        # Convert to array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    
    def predict(self, image):
        """
        Predict if image contains a water bottle
        
        Args:
            image: PIL Image object or file-like object
        
        Returns:
            Dictionary with prediction and confidence
        """
        # Preprocess the image
        processed_image = self.preprocess_image(image)
        
        # Make prediction
        prediction = self.model.predict(processed_image, verbose=0)
        
        # Get confidence (probability)
        confidence = float(prediction[0][0])
        
        # Determine class based on threshold (0.5 for binary classification)
        is_water_bottle = confidence > 0.5
        class_name = "water_bottle" if is_water_bottle else "not_water_bottle"
        
        # For water_bottle class, confidence is the prediction score
        # For not_water_bottle, confidence is 1 - prediction score
        if is_water_bottle:
            final_confidence = confidence
        else:
            final_confidence = 1 - confidence
        
        return {
            'class': class_name,
            'confidence': final_confidence,
            'is_water_bottle': is_water_bottle,
            'raw_score': confidence
        }

def create_sample_data_for_testing():
    """
    Create minimal sample data if no real data is available
    This is only for testing the pipeline
    """
    import os
    from PIL import Image, ImageDraw
    
    # Create directories
    os.makedirs('data/train/water_bottle', exist_ok=True)
    os.makedirs('data/train/not_water_bottle', exist_ok=True)
    os.makedirs('data/validation/water_bottle', exist_ok=True)
    os.makedirs('data/validation/not_water_bottle', exist_ok=True)
    
    print("Created sample directory structure.")
    print("Please add actual images to these folders:")
    print("  - data/train/water_bottle/ (add water bottle images)")
    print("  - data/train/not_water_bottle/ (add other images)")
    print("  - data/validation/water_bottle/ (add water bottle images)")
    print("  - data/validation/not_water_bottle/ (add other images)")

if __name__ == "__main__":
    # For testing prediction without training
    print("This module provides prediction functions.")
    print("\nTo test prediction:")
    print("1. First train a model using train.py")
    print("2. Then use WaterBottleClassifier to make predictions")