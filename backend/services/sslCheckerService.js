import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SSLCheckerService {
  /**
   * Check SSL using Python script directly via spawn
   * @param {string|string[]} hosts - Single host or array of hosts to check
   * @returns {Promise<Object>} SSL check results
   */
  async checkSSLViaScript(hosts) {
    return new Promise((resolve, reject) => {
      const hostList = Array.isArray(hosts) ? hosts : [hosts];
      const scriptPath = path.join(__dirname, '..', 'scripts', 'ssl_checker.py');
      
      // Spawn Python process
      const pythonProcess = spawn('python', [
        scriptPath,
        '--hosts',
        ...hostList,
        '--json'
      ]);

      let result = '';
      let error = '';

      // Collect data from stdout
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      // Collect errors from stderr
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}: ${error}`));
          return;
        }

        try {
          const jsonResult = JSON.parse(result);
          resolve(jsonResult);
        } catch (e) {
          reject(new Error(`Failed to parse result: ${e.message}`));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start process: ${err.message}`));
      });
    });
  }

  /**
   * Check SSL using Flask API endpoint
   * @param {string|string[]} hosts - Single host or array of hosts to check
   * @returns {Promise<Object>} SSL check results
   */
  async checkSSLViaAPI(hosts) {
    try {
      const response = await axios.post('http://localhost:5000/api/check-ssl', {
        hosts: Array.isArray(hosts) ? hosts : [hosts]
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.data.error}`);
      }
      throw error;
    }
  }
}

// Example usage in Express route or Firebase Function
async function handleSSLCheck(req, res) {
  try {
    const { hosts, method = 'script' } = req.body; // 'script' or 'api'
    
    const sslChecker = new SSLCheckerService();
    let results;

    if (method === 'api') {
      results = await sslChecker.checkSSLViaAPI(hosts);
    } else {
      results = await sslChecker.checkSSLViaScript(hosts);
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export { SSLCheckerService, handleSSLCheck };