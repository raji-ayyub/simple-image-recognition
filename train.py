"""
Script to train the water bottle classifier
"""
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from model import create_model

def prepare_data(data_dir='data'):
    """
    Prepare training and validation data generators
    
    Args:
        data_dir: Directory containing 'train' and 'validation' folders
                  Each folder should have two subfolders: 'water_bottle' and 'not_water_bottle'
    """
    # Data augmentation for training set
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation set
    validation_datagen = ImageDataGenerator(rescale=1./255)
    
    # Training data generator
    train_generator = train_datagen.flow_from_directory(
        os.path.join(data_dir, 'train'),
        target_size=(128, 128),  # Resize images to 128x128
        batch_size=32,
        class_mode='binary'  # Binary classification
    )
    
    # Validation data generator
    validation_generator = validation_datagen.flow_from_directory(
        os.path.join(data_dir, 'validation'),
        target_size=(128, 128),
        batch_size=32,
        class_mode='binary'
    )
    
    return train_generator, validation_generator

def train_model(epochs=10):
    """
    Train the model and save it
    
    Args:
        epochs: Number of training epochs
    """
    print("Preparing data...")
    train_gen, val_gen = prepare_data()
    
    print("Creating model...")
    model = create_model()
    
    print("Training model...")
    history = model.fit(
        train_gen,
        steps_per_epoch=train_gen.samples // train_gen.batch_size,
        epochs=epochs,
        validation_data=val_gen,
        validation_steps=val_gen.samples // val_gen.batch_size
    )
    
    # Save the trained model
    model.save('water_bottle_model.h5')
    print("Model saved as 'water_bottle_model.h5'")
    
    # Print final accuracy
    final_train_acc = history.history['accuracy'][-1]
    final_val_acc = history.history['val_accuracy'][-1]
    print(f"\nTraining completed!")
    print(f"Final training accuracy: {final_train_acc:.2%}")
    print(f"Final validation accuracy: {final_val_acc:.2%}")
    
    return model

if __name__ == "__main__":
   
    sample_structure = """
    Create this directory structure for training:
    
    data/
    ├── train/
    │   ├── water_bottle/      # Put water bottle images here
    │   └── not_water_bottle/  # Put other images here
    └── validation/
        ├── water_bottle/      # Put water bottle images here
        └── not_water_bottle/  # Put other images here
    
    Minimum images needed: ~20 per folder for basic testing
    """
    
    # Check if data directory exists
    if not os.path.exists('data/train/water_bottle'):
        print("Please create the directory structure first:")
        print(sample_structure)
        print("\nFor quick testing, you can:")
        print("1. Download some water bottle images")
        print("2. Download some random images (cars, people, animals, etc.)")
        print("3. Place them in the appropriate folders")
    else:
        # Train with 5 epochs for quick testing
        train_model(epochs=5)