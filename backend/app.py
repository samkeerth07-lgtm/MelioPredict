from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="Melioidosis Risk Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = joblib.load("model.pkl")

# Input schema
class Patient(BaseModel):
    fever: int
    weakness: int
    skin_redness: int
    skin_swelling: int
    skin_ulcer: int
    joint_pain: int
    difficulty_moving: int
    persistent_cough: int
    diabetes: int
    kidney_disease: int
    lung_disease: int
    immune_disorder: int
    soil_contact: int
    flood_water: int
    farming_activity: int
    open_wound: int
    rain_exposure: int
    age: int
    gender: int

@app.get("/")
def home():
    return {"message": "Melioidosis ML API is running"}

@app.post("/predict")
def predict(data: Patient):

    features = np.array([[
        data.fever,
        data.weakness,
        data.skin_redness,
        data.skin_swelling,
        data.skin_ulcer,
        data.joint_pain,
        data.difficulty_moving,
        data.persistent_cough,
        data.diabetes,
        data.kidney_disease,
        data.lung_disease,
        data.immune_disorder,
        data.soil_contact,
        data.flood_water,
        data.farming_activity,
        data.open_wound,
        data.rain_exposure,
        data.age,
        data.gender
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][prediction]

    return {
        "prediction": "High Risk" if prediction == 1 else "Low Risk",
        "probability": round(float(probability) * 100, 2)
    }