require('dotenv').config();
const express = require('express');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const WindowsInstanceConnector = require('./windows-connector');
const fs = require('fs');
const os = require('os');
const KeyCompressor = require('./utils/key-compressor');
const multer = require('multer');
const upload = multer({ dest: os.tmpdir() });
const app = express();
const port = process.env.PORT || 3000;

// Configure AWS
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Enable Cross-Origin Resource Sharing
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Special handling for .wasm files
app.get('*.wasm', (req, res, next) => {
  const options = {
    root: path.join(__dirname),
    headers: {
      'Content-Type': 'application/wasm'
    }
  };
  res.sendFile(req.path.substring(1), options);
});

// API route to get Node.js version
app.get('/api/version', (req, res) => {
  res.send(process.version);
});

// Claude AI API route
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const params = {
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    };

    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);
    
    // Parse the response body from a Uint8Array to string to JSON
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({
      response: responseBody.content[0].text,
      model: "Claude 4 via AWS Bedrock"
    });
  } catch (error) {
    console.error('Error calling Claude:', error);
    res.status(500).json({ 
      error: 'Error processing request',
      details: error.message 
    });
  }
});

// Windows Instance Connector Routes
app.get('/api/windows/status', async (req, res) => {
  try {
    if (!process.env.WINDOWS_INSTANCE_ID) {
      return res.status(404).json({ 
        status: 'not_configured',
        message: 'Windows instance ID not configured'
      });
    }
    
    const connector = new WindowsInstanceConnector();
    const instanceDetails = await connector.getInstanceDetails();
    
    res.json({
      status: 'configured',
      instance: {
        id: instanceDetails.InstanceId,
        type: instanceDetails.InstanceType,
        state: instanceDetails.State.Name,
        publicIp: instanceDetails.PublicIpAddress || 'N/A',
        privateIp: instanceDetails.PrivateIpAddress || 'N/A',
        availabilityZone: instanceDetails.Placement?.AvailabilityZone || 'N/A',
        launchTime: instanceDetails.LaunchTime
      }
    });
  } catch (error) {
    console.error('Error getting Windows instance status:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

app.post('/api/windows/connect', async (req, res) => {
  try {
    if (!process.env.WINDOWS_INSTANCE_ID) {
      return res.status(404).json({ 
        success: false,
        message: 'Windows instance ID not configured'
      });
    }
    
    const { connectionType } = req.body;
    
    const connector = new WindowsInstanceConnector({
      connectionType: connectionType || 'rdp'
    });
    
    const result = await connector.connect();
    
    res.json({
      success: true,
      message: `Windows instance connection initiated via ${connectionType || 'rdp'}`,
      details: result
    });
  } catch (error) {
    console.error('Error connecting to Windows instance:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Key Compression API Routes
app.post('/api/keys/compress', upload.single('keyFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No key file provided' 
      });
    }

    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required for key compression' 
      });
    }

    // Generate output filename
    const outputPath = path.join(
      os.tmpdir(), 
      `${path.basename(req.file.originalname, path.extname(req.file.originalname))}_compressed.key`
    );
    
    // Compress the key
    await KeyCompressor.compressFile(req.file.path, outputPath, password);
    
    // Respond with the compressed key file
    res.download(outputPath, `${path.basename(req.file.originalname, path.extname(req.file.originalname))}_compressed.key`, (err) => {
      // Clean up temp files after download
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      
      if (err) {
        console.error('Error sending compressed file:', err);
      }
    });
  } catch (error) {
    console.error('Error compressing key:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error compressing key',
      details: error.message 
    });
    
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

app.post('/api/windows/compress-key', async (req, res) => {
  try {
    const { password, outputFilename } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required for key compression' 
      });
    }

    if (!process.env.WINDOWS_PRIVATE_KEY_PATH) {
      return res.status(404).json({ 
        success: false, 
        message: 'No Windows private key configured in .env' 
      });
    }

    const connector = new WindowsInstanceConnector();
    const outputPath = path.join(
      os.tmpdir(),
      outputFilename || 'windows_key_compressed.key'
    );
    
    await connector.compressPrivateKey(outputPath, password);
    
    res.download(outputPath, path.basename(outputPath), (err) => {
      // Clean up after download
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      
      if (err) {
        console.error('Error sending compressed Windows key:', err);
      }
    });
  } catch (error) {
    console.error('Error compressing Windows key:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error compressing Windows key',
      details: error.message 
    });
  }
});

// Catch-all route to serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║    Project RED X Server Running       ║
  ║    with Claude 4 AI Integration       ║
  ║    and Windows Instance Connector     ║
  ║                                       ║
  ║    http://localhost:${port}              ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  
  Press Ctrl+C to stop the server
  `);
});
