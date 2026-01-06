"""
Simple CNN model for binary image classification
"""
import tensorflow as tf
from tensorflow.keras import layers, models


def create_model(input_shape=(128, 128, 3)):
    """
    Create a Convolutional Neural Network for binary classification
    
    Args:
        input_shape: Shape of input images (height, width, channels)
    
    Returns:
        Compiled Keras model
    """
    model = models.Sequential([
        # First convolutional block
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D((2, 2)),
        
        # Second convolutional block
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        
        # Third convolutional block
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        
        # Flatten and dense layers
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),  # Prevent overfitting
        
        # Output layer (binary classification: water bottle or not)
        layers.Dense(1, activation='sigmoid')
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

if __name__ == "__main__":
    # Test the model creation
    model = create_model()
    model.summary()