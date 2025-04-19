/**
 * URL Validation Script
 * 
 * This script scans markdown and HTML files for URLs and checks if they're valid.
 * It generates a report in the url-report directory.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// Directories to scan
const dirsToScan = [
  'docs',
  'build',
  '.github'
];

// File extensions to check
const extensionsToCheck = ['.md', '.html', '.json'];

// Create report directory if it doesn't exist
const reportDir = path.join(__dirname, '..', 'url-report');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// URL regex pattern - matches most URLs
const urlRegex = /(https?:\/\/[^\s"<>,]+)/g;

// Check if a URL is valid by sending a HEAD request
async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      const statusCode = res.statusCode;
      resolve({
        url,
        valid: statusCode >= 200 && statusCode < 400,
        statusCode
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        valid: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        valid: false,
        error: 'Request timed out'
      });
    });
    
    req.end();
  });
}

// Scan a directory recursively for files
async function scanDirectory(dir) {
  const files = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry !== 'node_modules' && entry !== '.git') {
        const subDirFiles = await scanDirectory(fullPath);
        files.push(...subDirFiles);
      }
    } else if (stats.isFile() && extensionsToCheck.some(ext => entry.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main function
async function main() {
  console.log('Starting URL validation...');
  const startTime = Date.now();
  const results = { valid: 0, invalid: 0, details: [] };
  
  try {
    // Get all files to check
    let filesToCheck = [];
    for (const dir of dirsToScan) {
      const dirPath = path.join(__dirname, '..', dir);
      
      if (fs.existsSync(dirPath)) {
        const files = await scanDirectory(dirPath);
        filesToCheck = [...filesToCheck, ...files];
      }
    }
    
    console.log(`Found ${filesToCheck.length} files to check`);
    
    // Check each file for URLs
    for (const file of filesToCheck) {
      const content = await readFile(file, 'utf8');
      const urls = content.match(urlRegex) || [];
      
      // Remove duplicates
      const uniqueUrls = [...new Set(urls)];
      
      if (uniqueUrls.length > 0) {
        console.log(`Checking ${uniqueUrls.length} URLs in ${file}...`);
        
        const fileResults = {
          file: path.relative(__dirname, file),
          urls: []
        };
        
        // Check each URL
        for (const url of uniqueUrls) {
          try {
            const result = await checkUrl(url);
            fileResults.urls.push(result);
            
            if (result.valid) {
              results.valid++;
            } else {
              results.invalid++;
              console.log(`  ❌ Invalid URL: ${url} - ${result.error || result.statusCode}`);
            }
          } catch (error) {
            console.error(`Error checking URL ${url}:`, error);
          }
        }
        
        results.details.push(fileResults);
      }
    }
    
    // Generate report
    const endTime = Date.now();
    const reportData = {
      summary: {
        totalUrls: results.valid + results.invalid,
        validUrls: results.valid,
        invalidUrls: results.invalid,
        timeElapsedMs: endTime - startTime
      },
      results: results.details
    };
    
    const reportPath = path.join(reportDir, 'url-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    // Generate a more readable HTML report
    const htmlReport = generateHtmlReport(reportData);
    const htmlReportPath = path.join(reportDir, 'url-validation-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log('\nURL validation complete!');
    console.log(`Total URLs checked: ${reportData.summary.totalUrls}`);
    console.log(`Valid URLs: ${reportData.summary.validUrls}`);
    console.log(`Invalid URLs: ${reportData.summary.invalidUrls}`);
    console.log(`Time taken: ${(reportData.summary.timeElapsedMs / 1000).toFixed(2)}s`);
    console.log(`\nReports generated:`);
    console.log(`- JSON report: ${reportPath}`);
    console.log(`- HTML report: ${htmlReportPath}`);
    
    // If there are invalid URLs, exit with error code
    if (results.invalid > 0) {
      console.log('\n⚠️ Found invalid URLs in your files. Check the report for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during URL validation:', error);
    process.exit(1);
  }
}

// Generate HTML report
function generateHtmlReport(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URL Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2c3e50; }
    h2 { color: #3498db; }
    .summary {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .summary-item {
      padding: 10px;
      border-radius: 5px;
    }
    .total { background-color: #e3f2fd; }
    .valid { background-color: #e8f5e9; }
    .invalid { background-color: #ffebee; }
    .time { background-color: #fff8e1; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .url-valid {
      color: #2e7d32;
    }
    .url-invalid {
      color: #c62828;
    }
    .file-header {
      background-color: #eceff1;
      padding: 10px;
      margin-top: 20px;
      margin-bottom: 5px;
      border-radius: 5px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>URL Validation Report</h1>
  
  <div class="summary">
    <div class="summary-item total">
      <div>Total URLs</div>
      <div><strong>${data.summary.totalUrls}</strong></div>
    </div>
    <div class="summary-item valid">
      <div>Valid URLs</div>
      <div><strong>${data.summary.validUrls}</strong></div>
    </div>
    <div class="summary-item invalid">
      <div>Invalid URLs</div>
      <div><strong>${data.summary.invalidUrls}</strong></div>
    </div>
    <div class="summary-item time">
      <div>Time Elapsed</div>
      <div><strong>${(data.summary.timeElapsedMs / 1000).toFixed(2)}s</strong></div>
    </div>
  </div>
  
  <h2>Detailed Results</h2>
  
  ${data.results.map(fileResult => `
    <div class="file-header">${fileResult.file}</div>
    <table>
      <tr>
        <th>URL</th>
        <th>Status</th>
        <th>Details</th>
      </tr>
      ${fileResult.urls.map(url => `
        <tr>
          <td>${url.url}</td>
          <td class="${url.valid ? 'url-valid' : 'url-invalid'}">${url.valid ? 'Valid' : 'Invalid'}</td>
          <td>${url.statusCode || url.error || ''}</td>
        </tr>
      `).join('')}
    </table>
  `).join('')}
</body>
</html>`;
}

// Run the main function
main();