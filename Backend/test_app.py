from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "FertiSmart Backend API",
        "status": "running",
        "version": "1.0.0"
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint without database"""
    return jsonify({
        "message": "Backend is working correctly!",
        "status": "success"
    })

@app.route('/api/soil-test', methods=['POST'])
def submit_soil_test():
    """Submit soil test data (mock response)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'moisture']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Mock response (without database)
        mock_response = {
            "message": "Soil test submitted successfully (mock)",
            "id": 1,
            "data": {
                "ph": data['ph'],
                "nitrogen": data['nitrogen'],
                "phosphorus": data['phosphorus'],
                "potassium": data['potassium'],
                "moisture": data['moisture'],
                "checked_options": data.get('checked_options', []),
                "test_results": data.get('test_results', {}),
                "user_id": data.get('user_id', 'anonymous')
            }
        }
        
        logger.info(f"Soil test submitted successfully (mock): {mock_response['id']}")
        return jsonify(mock_response), 201
            
    except Exception as e:
        logger.error(f"Error submitting soil test: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Generate fertilizer recommendations (mock response)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ph', 'nitrogen', 'phosphorus', 'potassium']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Mock recommendation logic
        ph = float(data['ph'])
        nitrogen = float(data['nitrogen'])
        phosphorus = float(data['phosphorus'])
        potassium = float(data['potassium'])
        
        recommendations = []
        
        # pH recommendations
        if ph < 6.0:
            recommendations.append({
                "type": "pH Adjustment",
                "recommendation": "Apply lime to increase soil pH to optimal range (6.0-7.0)",
                "priority": "high"
            })
        elif ph > 7.5:
            recommendations.append({
                "type": "pH Adjustment", 
                "recommendation": "Apply sulfur or acidifying fertilizers to lower soil pH",
                "priority": "high"
            })
        
        # Nutrient recommendations
        if nitrogen < 20:
            recommendations.append({
                "type": "Fertilizer",
                "recommendation": "Apply nitrogen-rich fertilizer (N-P-K: 20-10-10)",
                "priority": "high"
            })
        
        if phosphorus < 15:
            recommendations.append({
                "type": "Fertilizer",
                "recommendation": "Apply phosphorus-rich fertilizer (N-P-K: 10-20-10)",
                "priority": "medium"
            })
        
        if potassium < 20:
            recommendations.append({
                "type": "Fertilizer",
                "recommendation": "Apply potassium-rich fertilizer (N-P-K: 10-10-20)",
                "priority": "medium"
            })
        
        # If all nutrients are adequate
        if not recommendations:
            recommendations.append({
                "type": "Maintenance",
                "recommendation": "Soil nutrients are in good balance. Continue regular soil testing.",
                "priority": "low"
            })
        
        return jsonify({
            "message": "Recommendations generated successfully (mock)",
            "recommendations": recommendations,
            "soil_analysis": {
                "ph": ph,
                "nitrogen": nitrogen,
                "phosphorus": phosphorus,
                "potassium": potassium
            },
            "recommendation_id": 1
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting FertiSmart Backend (TEST MODE) on port {port}")
    logger.info("This is a test version without Supabase - all data is mocked")
    app.run(host='0.0.0.0', port=port, debug=debug)
