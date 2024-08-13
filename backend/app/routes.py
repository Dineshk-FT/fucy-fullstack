from flask import current_app as app
from flask import request,jsonify,json
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from bson import ObjectId

clientMongo = MongoClient('mongodb://localhost:27017')
db = clientMongo['MY_DB']

@app.route('/', methods=['GET'])
def hello():
    return "Hello world"

# For Login-----------------------------------------------------------------------------------------------
@app.route('/register', methods=['POST'])
def register():
    try:
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Check if the username already exists
        if db.accounts.find_one({'username': username}):
            return jsonify({"error": "Username already exists"}), 400

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        db.accounts.insert_one({'username': username, 'password': hashed_password})
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/login', methods=['POST'])
def login():
    try:
        username = request.form.get('username')
        password = request.form.get('password')
        
        
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        user = db.accounts.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            return jsonify({"message": "Logged in successfully!"}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/request-reset-password', methods=['POST'])
def request_reset_password():
    try:
        username = request.form.get('username')

        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        user = db.accounts.find_one({'username': username})
        print(username)
        if user:
            reset_token = str(uuid.uuid4())
            db.accounts.insert_one({'username': username, 'reset_token': reset_token})
            return jsonify({"message": "Password reset requested. Check your email for the reset link.", "reset_token": reset_token}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reset-password', methods=['POST'])
def reset_password():
    # if request.content_type != 'application/json':
    #     return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        new_password = request.form.get('new_password')
        reset_token = request.form.get('reset_token')

        if not reset_token or not new_password:
            return jsonify({"error": "Reset token and new password are required"}), 400

        reset_entry = db.accounts.find_one({'reset_token': reset_token})
        if reset_entry:
            hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
            db.accounts.update_one({'username': reset_entry['username']}, {'$set': {'password': hashed_password}})
            db.accounts.delete_one({'reset_token': reset_token})
            return jsonify({"message": "Password has been reset successfully!"}), 200
        else:
            return jsonify({"error": "Invalid or expired reset token"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# For Fetching--------------------------------------------------------------------------------------------
@app.route('/get_details/sidebarNode', methods=['POST'])
def sideBarNode():
    data = list(db.side_bar_nodes.find({}))
    for item in data:
        item['_id'] = str(item['_id'])
    
    return jsonify(data)

@app.route('/get_details/templates', methods=['POST'])
def tepmlet():
    data = list(db.templates.find({}))
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

@app.route('/get_details/Models', methods=['GET'])
def Modelslet():
    data = list(db.models.find({}))
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

@app.route('/get_details/Models/<model_id>', methods=['GET'])
def get_model_by_id(model_id):
    try:
        # Convert string id to ObjectId
        model_id = ObjectId(model_id)
    except Exception as e:
        return jsonify({"error": "Invalid ID format"}), 400

    # Fetch the model from the database
    data = db.models.find_one({"_id": model_id})
    if data:
        # Convert ObjectId to string
        data['_id'] = str(data['_id'])
        return jsonify(data)
    else:
        return jsonify({"error": "Model not found"}), 404
    
@app.route('/get_details/templates/<template_id>', methods=['GET'])
def get_template_by_id(template_id):
    try:
        # Convert string id to ObjectId
        template_id = ObjectId(template_id)
    except Exception as e:
        return jsonify({"error": "Invalid ID format"}), 400

    # Fetch the model from the database
    data = db.templates.find_one({"_id": template_id})
    if data:
        # Convert ObjectId to string
        data['_id'] = str(data['_id'])
        return jsonify(data)
    else:
        return jsonify({"error": "Model not found"}), 404
    
# For Adding---------------------------------------------------------------------------------------------
@app.route('/add/sidebarNode', methods=['POST'])
def addSideBarNode():
    try:
        name = request.form.get('name')
        if not name:
            return jsonify({"error": "Name is required"}), 400
        data=[{
                "name":name,
                "nodes": []
            }]
        db.side_bar_nodes.insert_many(data)  
        return jsonify({"message": "Side Bar Node inserted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add/Models', methods=['POST'])
def addModelslets():
      try:
          name = request.form.get('name')
          if not name:
            return jsonify({"error": "Name is required"}), 400
          data=[{
                "name":name
            }]
          db.models.insert_many(data)  
          return jsonify({"message": "Model Created successfully!"}), 201

      except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/add/node', methods=['POST'])
def addNode():
    try:
        node_id = request.form.get('id')        
        if not node_id:
            return jsonify({"error": "Id is required"}), 400
        
        object_id = ObjectId(node_id)
        data = db.side_bar_nodes.find_one({"_id": object_id})
        
        if data is None:
            return jsonify({"error": "Node not found"}), 404
        new_node = request.form.get('new_node') 
        new=json.loads(new_node)
        if 'nodes' not in data or not isinstance(data['nodes'], list):
            data['nodes'] = []
        data['nodes'].append(new)
        db.side_bar_nodes.update_one({"_id": object_id}, {"$set": {"nodes": data['nodes']}})
            
        return jsonify({"message": "Node inserted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/add/templates', methods=['POST'])
def addTemplets():
    try:
        data = request.form.get('templates')
        new=json.loads(data)
        # app.logger.info("D A T A >>>>>>>>>>>{}".format(new))
        # if not isinstance(data, list):
        #     return jsonify({"error": "Input data should be a list of nodes"}), 400
        db.templates.insert_many(new)  
        return jsonify({"message": "Templates inserted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route('/add/Models', methods=['POST'])
# def addModelslets():
#     try:
#         data = request.form.get('models')
#         new=json.loads(data)
#         # app.logger.info("D A T A >>>>>>>>>>>{}".format(new))
#         # if not isinstance(data, list):
#         #     return jsonify({"error": "Input data should be a list of nodes"}), 400
#         db.templets.insert_many(new)  
#         return jsonify({"message": "Model Created successfully!"}), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# For Updating----------------------------------------------------------------------------------------------------
@app.route('/update_model/<model_id>', methods=['PUT'])
def update_model(model_id):
    try:
        model_id = ObjectId(model_id)
    except Exception as e:
        return jsonify({"error": "Invalid ID format"}), 400

    # Get the data from the request
    updated_data = request.json

    # Remove the _id field from the update data if it exists
    if '_id' in updated_data:
        del updated_data['_id']

    # Update the model in the database
    result = db.models.update_one({"_id": model_id}, {"$set": updated_data})

    if result.matched_count > 0:
        if result.modified_count > 0:
            return jsonify({"message": "Model updated successfully"})
        else:
            return jsonify({"message": "No changes made to the model"}), 304
    else:
        return jsonify({"error": "Model not found"}), 404