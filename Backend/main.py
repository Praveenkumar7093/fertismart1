from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register AI blueprint
from routes.ai_routes import ai_bp
app.register_blueprint(ai_bp)

# Initialize ML models on startup (sklearn models only; TF models load lazily)
def _init_ml_models():
    try:
        from services.model_trainer import ensure_models_exist
        ensure_models_exist()
        logger.info("Sklearn ML models initialized")
    except Exception as e:
        logger.warning(f"ML model init deferred: {e}")

_init_ml_models()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client (with fallback for missing credentials)
supabase = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != 'your_supabase_project_url_here' and SUPABASE_KEY != 'your_supabase_anon_key_here':
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {str(e)}")
        supabase = None
else:
    logger.warning("Supabase credentials not found or not configured. Running in mock mode.")
    supabase = None

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "FertiSmart Backend API",
        "status": "running",
        "version": "2.0.0",
        "modules": [
            "disease_detection", "crop_recommendation",
            "fertilizer_recommendation", "yield_prediction", "chatbot",
        ],
    })

@app.route('/api/soil-test', methods=['POST'])
def submit_soil_test():
    """Submit soil test data to database"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'moisture']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Prepare data for database
        soil_test_data = {
            'ph': float(data['ph']),
            'nitrogen': float(data['nitrogen']),
            'phosphorus': float(data['phosphorus']),
            'potassium': float(data['potassium']),
            'moisture': float(data['moisture']),
            'location': data.get('location', ''),
            'crop_type': data.get('crop_type', ''),
            'test_date': data.get('test_date', ''),
            'notes': data.get('notes', ''),
            'checked_options': data.get('checked_options', []),  # Array of checked options
            'test_results': data.get('test_results', {}),  # Store the results of the test
            'user_id': data.get('user_id', 'anonymous')  # Track which user submitted the test
        }
        
        # Insert into Supabase (if available)
        if supabase:
            try:
                result = supabase.table('soil_tests').insert(soil_test_data).execute()
                
                if result.data:
                    logger.info(f"Soil test submitted successfully: {result.data[0]['id']}")
                    return jsonify({
                        "message": "Soil test submitted successfully",
                        "id": result.data[0]['id'],
                        "data": result.data[0]
                    }), 201
                else:
                    return jsonify({"error": "Failed to submit soil test"}), 500
            except Exception as e:
                logger.error(f"Database error: {str(e)}")
                return jsonify({"error": "Database connection failed"}), 500
        else:
            # Mock response when Supabase is not available
            mock_id = 1
            logger.info(f"Soil test submitted successfully (mock): {mock_id}")
            return jsonify({
                "message": "Soil test submitted successfully (mock mode - no database)",
                "id": mock_id,
                "data": soil_test_data
            }), 201
            
    except Exception as e:
        logger.error(f"Error submitting soil test: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/soil-tests', methods=['GET'])
def get_soil_tests():
    """Get all soil tests from database"""
    try:
        if supabase:
            result = supabase.table('soil_tests').select('*').order('created_at', desc=True).execute()
            
            return jsonify({
                "message": "Soil tests retrieved successfully",
                "data": result.data,
                "count": len(result.data)
            }), 200
        else:
            # Mock response when Supabase is not available
            return jsonify({
                "message": "Soil tests retrieved successfully (mock mode - no database)",
                "data": [],
                "count": 0
            }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving soil tests: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/soil-test/<int:test_id>', methods=['GET'])
def get_soil_test(test_id):
    """Get specific soil test by ID"""
    try:
        if supabase:
            result = supabase.table('soil_tests').select('*').eq('id', test_id).execute()
            
            if result.data:
                return jsonify({
                    "message": "Soil test retrieved successfully",
                    "data": result.data[0]
                }), 200
            else:
                return jsonify({"error": "Soil test not found"}), 404
        else:
            # Mock response when Supabase is not available
            return jsonify({
                "message": "Soil test retrieved successfully (mock mode - no database)",
                "data": {"id": test_id, "ph": 6.5, "nitrogen": 25.0, "phosphorus": 18.0, "potassium": 22.0, "moisture": 15.0}
            }), 200
            
    except Exception as e:
        logger.error(f"Error retrieving soil test {test_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Generate fertilizer recommendations based on soil test data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ph', 'nitrogen', 'phosphorus', 'potassium']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Simple recommendation logic (you can enhance this)
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
        
        # Store recommendations in database (if Supabase is available)
        recommendation_id = None
        if supabase:
            recommendation_data = {
                'soil_test_id': data.get('soil_test_id'),
                'checked_options': data.get('checked_options', []),
                'recommendations': recommendations,
                'soil_analysis': {
                    'ph': ph,
                    'nitrogen': nitrogen,
                    'phosphorus': phosphorus,
                    'potassium': potassium
                },
                'user_id': data.get('user_id', 'anonymous')
            }
            
            # Insert recommendations into database
            try:
                rec_result = supabase.table('recommendations').insert(recommendation_data).execute()
                recommendation_id = rec_result.data[0]['id'] if rec_result.data else None
            except Exception as e:
                logger.warning(f"Failed to store recommendations: {str(e)}")
                recommendation_id = None
        else:
            recommendation_id = 1  # Mock ID
        
        return jsonify({
            "message": "Recommendations generated successfully",
            "recommendations": recommendations,
            "soil_analysis": {
                "ph": ph,
                "nitrogen": nitrogen,
                "phosphorus": phosphorus,
                "potassium": potassium
            },
            "recommendation_id": recommendation_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/recent-options', methods=['GET'])
def get_recent_checked_options():
    """Get recently checked options from soil tests"""
    try:
        if supabase:
            # Get recent soil tests with checked options
            result = supabase.table('soil_tests').select('id, checked_options, test_results, created_at').order('created_at', desc=True).limit(10).execute()
            
            recent_options = []
            for test in result.data:
                if test.get('checked_options'):
                    recent_options.append({
                        'test_id': test['id'],
                        'checked_options': test['checked_options'],
                        'test_results': test.get('test_results', {}),
                        'created_at': test['created_at']
                    })
        else:
            # Mock response when Supabase is not available
            recent_options = []
        
        return jsonify({
            "message": "Recent checked options retrieved successfully",
            "data": recent_options,
            "count": len(recent_options)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving recent options: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/recommendations/<int:rec_id>', methods=['GET'])
def get_recommendation(rec_id):
    """Get specific recommendation by ID"""
    try:
        if supabase:
            result = supabase.table('recommendations').select('*').eq('id', rec_id).execute()
            
            if result.data:
                return jsonify({
                    "message": "Recommendation retrieved successfully",
                    "data": result.data[0]
                }), 200
            else:
                return jsonify({"error": "Recommendation not found"}), 404
        else:
            # Mock response when Supabase is not available
            return jsonify({
                "message": "Recommendation retrieved successfully (mock mode - no database)",
                "data": {"id": rec_id, "recommendations": [], "soil_analysis": {}}
            }), 200
            
    except Exception as e:
        logger.error(f"Error retrieving recommendation {rec_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/recommendations', methods=['GET'])
def get_all_recommendations():
    """Get all recommendations with checked options"""
    try:
        if supabase:
            result = supabase.table('recommendations').select('*').order('created_at', desc=True).execute()
            
            return jsonify({
                "message": "Recommendations retrieved successfully",
                "data": result.data,
                "count": len(result.data)
            }), 200
        else:
            # Mock response when Supabase is not available
            return jsonify({
                "message": "Recommendations retrieved successfully (mock mode - no database)",
                "data": [],
                "count": 0
            }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/user-history/<user_id>', methods=['GET'])
def get_user_history(user_id):
    """Get user's soil test and recommendation history"""
    try:
        if supabase:
            # Get user's soil tests
            soil_tests = supabase.table('soil_tests').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            
            # Get user's recommendations
            recommendations = supabase.table('recommendations').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            
            return jsonify({
                "message": "User history retrieved successfully",
                "data": {
                    "soil_tests": soil_tests.data,
                    "recommendations": recommendations.data,
                    "soil_test_count": len(soil_tests.data),
                    "recommendation_count": len(recommendations.data)
                }
            }), 200
        else:
            # Mock response when Supabase is not available
            return jsonify({
                "message": "User history retrieved successfully (mock mode - no database)",
                "data": {
                    "soil_tests": [],
                    "recommendations": [],
                    "soil_test_count": 0,
                    "recommendation_count": 0
                }
            }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving user history for {user_id}: {str(e)}")
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
    
    logger.info(f"Starting FertiSmart Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
