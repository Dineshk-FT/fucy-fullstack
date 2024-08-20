from app import create_app
from waitress import serve
from flask_cors import CORS

app = create_app()

# Enable CORS for specific URLs
CORS(app, origins=["http://localhost:3000", "http://localhost:3001","https://www.fucytech.com", "https://newwww.fucytech.com"])

if __name__ == '__main__':
    # print("running Locally")
    serve(app, host='0.0.0.0', port=5000)
# if __name__ == '__main__':
#     app.run(debug=True)
