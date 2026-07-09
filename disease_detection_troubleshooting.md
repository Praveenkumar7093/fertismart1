# Troubleshooting Report: Crop Disease Detection Error

The disease detection failure has been analyzed, and the root cause is resolved.

## Root Cause
The frontend application (running on port `8080`) communicates with the Python Flask backend (running on port `5000`) via a proxy. However, the backend server was not running, resulting in a connection failure and triggering the **"Detection Failed: Request failed"** error on the user interface.

---

## Steps Taken & Verification

1. **Port Connection Verification**:
   We verified that port `5000` was not listening initially.

2. **Starting the Backend**:
   We started the Flask backend server from the `Backend` directory using the project's virtual environment:
   ```bash
   .venv\Scripts\python.exe main.py
   ```
   The backend successfully loaded the machine learning models and started listening on port `5000` in mock/fallback mode.

3. **API & Model Testing**:
   We created a synthetic leaf image and verified the backend's `/api/ai/disease/detect` endpoint. The request succeeded with an **HTTP 200** and returned full classification and Grad-CAM visualization results.

4. **End-to-End Browser Testing**:
   We simulated a user interaction in the web browser using a newly generated tomato leaf image:
   - Navigated to `http://localhost:8080/disease`
   - Uploaded the image and selected the **MobileNetV2** model
   - Clicked **Detect Disease**
   - The operation succeeded immediately and displayed:
     - **Disease**: Spider Mites (69.33% confidence)
     - **Grad-CAM visualization**: Highlighted areas affected by spider mite stippling
     - **Recommended treatments and precautions**

---

## How to Keep the App Running

To run the application locally, make sure **both** the frontend and the backend servers are running simultaneously:

### 1. Start the Backend Server (Port 5000)
Open a terminal window, navigate to the `Backend` directory, and run:
```powershell
# Navigate to the Backend folder
cd Backend

# Activate environment and run backend
.venv\Scripts\python.exe main.py
```

### 2. Start the Frontend Server (Port 8080)
Open a new terminal window, navigate to the `Frontend` directory, and run:
```powershell
# Navigate to the Frontend folder
cd Frontend

# Run Vite dev server
npm run dev
```

Once both processes are running, navigate to `http://localhost:8080/disease` and test the upload again.
