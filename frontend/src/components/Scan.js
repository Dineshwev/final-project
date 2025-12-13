import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Scan = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleScan = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setError(null);
    setScanResults(null);
    setProgress(0);

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api';
      
      // Step 1: Start the scan
      const response = await fetch(`${apiUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const scanId = data.data.scanId;
      
      // Step 2: Poll for results with faster timeout
      const pollForResults = async () => {
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max (reduced from 60)
        
        while (attempts < maxAttempts) {
          attempts++;
          
          // Check scan status
          const statusResponse = await fetch(`${apiUrl}/scan/${scanId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.data.status === 'completed') {
            // Get the full results
            const resultsResponse = await fetch(`${apiUrl}/scan/${scanId}/results`);
            const resultsData = await resultsResponse.json();
            
            if (resultsData.status === 'success') {
              setProgress(100);
              setScanResults(resultsData.data);
              return;
            }
          } else if (statusData.data.status === 'failed') {
            throw new Error('Scan failed on the server');
          } else if (statusData.data.status === 'in-progress') {
            // Update progress based on server progress
            setProgress(statusData.data.progress || Math.min(90, attempts * 3));
          } else {
            // Pending status - show progress
            setProgress(Math.min(80, attempts * 2.5));
          }
          
          // Wait 1 second before polling again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error('Scan is taking longer than expected. Please try a different URL or try again later.');
      };
      
      await pollForResults();
    } catch (error) {
      console.error('Error during scan:', error);
      setError(error.message || 'Failed to scan website. Please try again.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <MagnifyingGlassIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            SEO Health Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze your website's SEO, performance, accessibility, and security in seconds
          </p>
        </div>

        {/* Scan Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleScan} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-lg font-semibold text-gray-900 mb-2">
                  Enter Website URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    disabled={isScanning}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Scanning...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isScanning}
                className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {isScanning ? (
                  <>
                    <ArrowPathIcon className="h-6 w-6 mr-2 animate-spin" />
                    Scanning Website...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
                    Start SEO Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Scan Failed</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Results */}
        {scanResults && (
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Success Banner */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Scan Complete!</h3>
                  <p className="text-green-700 mt-1">Successfully analyzed {scanResults.url || url}</p>
                  {scanResults.completedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Completed at: {new Date(scanResults.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Score Cards */}
            {scanResults.lighthouse?.scores && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScoreCard
                  title="Performance"
                  score={scanResults.lighthouse.scores.performance}
                  icon={<BoltIcon className="h-8 w-8" />}
                  color="blue"
                />
                <ScoreCard
                  title="SEO"
                  score={scanResults.lighthouse.scores.seo}
                  icon={<ChartBarIcon className="h-8 w-8" />}
                  color="purple"
                />
                <ScoreCard
                  title="Accessibility"
                  score={scanResults.lighthouse.scores.accessibility}
                  icon={<EyeIcon className="h-8 w-8" />}
                  color="green"
                />
                <ScoreCard
                  title="Best Practices"
                  score={scanResults.lighthouse.scores.bestPractices}
                  icon={<ShieldCheckIcon className="h-8 w-8" />}
                  color="indigo"
                />
              </div>
            )}

            {/* SEO Analysis Details */}
            {scanResults.seo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Metadata */}
                {scanResults.seo.metadata && (
                  <DetailCard 
                    title="Metadata Analysis"
                    icon={<ChartBarIcon className="h-6 w-6 text-blue-600" />}
                    data={scanResults.seo.metadata}
                  />
                )}
                
                {/* Headings */}
                {scanResults.seo.headings && (
                  <DetailCard 
                    title="Heading Structure"
                    icon={<ChartBarIcon className="h-6 w-6 text-purple-600" />}
                    data={scanResults.seo.headings}
                  />
                )}
                
                {/* Images */}
                {scanResults.seo.images && (
                  <DetailCard 
                    title="Image Analysis"
                    icon={<EyeIcon className="h-6 w-6 text-green-600" />}
                    data={scanResults.seo.images}
                  />
                )}
                
                {/* Links */}
                {scanResults.seo.links && (
                  <DetailCard 
                    title="Link Analysis"
                    icon={<ChartBarIcon className="h-6 w-6 text-indigo-600" />}
                    data={scanResults.seo.links}
                  />
                )}
              </div>
            )}

            {/* Recommendations */}
            {scanResults.recommendations && scanResults.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ExclamationCircleIcon className="h-8 w-8 text-yellow-500 mr-3" />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {scanResults.recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Raw Results */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Analysis Data</h3>
              <div className="prose max-w-none">
                <pre className="bg-gray-50 p-6 rounded-xl overflow-auto text-sm border border-gray-200 max-h-96">
                  {JSON.stringify(scanResults, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Features Section (shown when no scan is active) */}
        {!isScanning && !scanResults && !error && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<BoltIcon className="h-10 w-10 text-blue-600" />}
              title="Lightning Fast"
              description="Get comprehensive SEO analysis results in seconds"
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-10 w-10 text-purple-600" />}
              title="Security Check"
              description="Analyze SSL certificates and security headers"
            />
            <FeatureCard
              icon={<ChartBarIcon className="h-10 w-10 text-green-600" />}
              title="Detailed Reports"
              description="Receive actionable insights and recommendations"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Score Card Component
const ScoreCard = ({ title, score, icon, color }) => {
  // Score is already in 0-100 range from backend, no need to multiply by 100
  const normalizedScore = Math.round(score);
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl">
      <div className={`inline-flex p-3 rounded-lg bg-${color}-100 text-${color}-600 mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className={`text-4xl font-bold ${getScoreColor(normalizedScore)}`}>
          {normalizedScore}
        </div>
        <div className="text-sm font-medium text-gray-500">/ 100</div>
      </div>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r ${getScoreBg(normalizedScore)} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Detail Card Component
const DetailCard = ({ title, icon, data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900 ml-2">{title}</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          // Skip rendering arrays of issues for now, we'll handle them separately
          if (key === 'issues' && Array.isArray(value)) {
            return (
              <div key={key} className="border-t pt-3 mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {value.map((issue, idx) => (
                    <li key={idx} className="text-sm text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            );
          }
          
          // Skip complex objects and arrays
          if (typeof value === 'object' && value !== null) {
            return null;
          }
          
          return (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ recommendation }) => {
  const priorityColors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const priorityBadgeColors = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white'
  };
  
  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${priorityColors[recommendation.priority] || priorityColors.low}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityBadgeColors[recommendation.priority] || priorityBadgeColors.low}`}>
              {recommendation.priority?.toUpperCase() || 'INFO'}
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {recommendation.category}
            </span>
          </div>
          <p className="text-sm text-gray-800">{recommendation.issue}</p>
        </div>
      </div>
    </div>
  );
};

export default Scan;