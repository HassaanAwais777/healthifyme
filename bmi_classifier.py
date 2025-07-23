import pickle
import numpy as np
import sys
import json

def load_bmi_classifier():
    """Load the BMI classifier model from pickle file"""
    try:
        with open('bmi_classifier.pkl', 'rb') as file:
            model = pickle.load(file)
        return model
    except Exception as e:
        print(f"Error loading BMI classifier: {e}")
        return None

def classify_bmi(height, weight, age, gender):
    """
    Classify BMI based on height, weight, age, and gender
    
    Args:
        height (float): Height in cm
        weight (float): Weight in kg
        age (int): Age in years
        gender (str): Gender ('male' or 'female')
    
    Returns:
        dict: Classification result with BMI value and category
    """
    try:
        # Load the model
        model = load_bmi_classifier()
        if model is None:
            return {"error": "Failed to load BMI classifier model"}
        
        # Calculate BMI
        height_m = height / 100  # Convert cm to meters
        bmi = weight / (height_m ** 2)
        
        # Prepare features for classification
        # Note: This is a placeholder. You may need to adjust based on your model's expected features
        features = np.array([[height, weight, age, 1 if gender.lower() == 'male' else 0]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Define BMI categories
        bmi_categories = {
            0: "Underweight",
            1: "Normal weight", 
            2: "Overweight",
            3: "Obese"
        }
        
        # Get category name
        category = bmi_categories.get(prediction, "Unknown")
        
        return {
            "bmi": round(bmi, 2),
            "category": category,
            "category_code": int(prediction),
            "height_cm": height,
            "weight_kg": weight,
            "age": age,
            "gender": gender
        }
        
    except Exception as e:
        return {"error": f"Classification error: {str(e)}"}

def main():
    """Main function to handle command line input"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments. Expected JSON string with height, weight, age, gender"}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        height = float(input_data.get('height'))
        weight = float(input_data.get('weight'))
        age = int(input_data.get('age'))
        gender = input_data.get('gender')
        
        # Validate input
        if not all([height, weight, age, gender]):
            print(json.dumps({"error": "Missing required fields: height, weight, age, gender"}))
            sys.exit(1)
        
        # Perform classification
        result = classify_bmi(height, weight, age, gender)
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)
    except ValueError as e:
        print(json.dumps({"error": f"Invalid input values: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main() 