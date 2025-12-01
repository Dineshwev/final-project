from flask import Flask, request, jsonify
from ssl_checker import SSLChecker
import json

app = Flask(__name__)

@app.route('/api/check-ssl', methods=['POST'])
def check_ssl():
    try:
        data = request.get_json()
        if not data or 'hosts' not in data:
            return jsonify({'error': 'Missing hosts in request body'}), 400

        hosts = data['hosts']
        if not isinstance(hosts, list):
            hosts = [hosts]  # Convert single host to list

        # Initialize SSL Checker
        ssl_checker = SSLChecker()
        
        # Get the results
        results = []
        for host in hosts:
            result = ssl_checker.get_certificate_info(host)
            results.append(result)

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)