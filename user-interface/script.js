// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const singleUploadArea = document.getElementById('singleUploadArea');
const singleImageInput = document.getElementById('singleImage');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const imageDimensions = document.getElementById('imageDimensions');
const imageSize = document.getElementById('imageSize');
const removeImageBtn = document.getElementById('removeImage');
const classifyBtn = document.getElementById('classifyBtn');
const processingStatus = document.getElementById('processingStatus');
const resultSection = document.getElementById('resultSection');
const predictionValue = document.getElementById('predictionValue');
const confidenceValue = document.getElementById('confidenceValue');
const bottleStatus = document.getElementById('bottleStatus');
const meterFill = document.getElementById('meterFill');
const meterPercentage = document.getElementById('meterPercentage');
const messageText = document.getElementById('messageText');
const batchUploadArea = document.getElementById('batchUploadArea');
const batchImagesInput = document.getElementById('batchImages');
const fileListContainer = document.getElementById('fileListContainer');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const clearFilesBtn = document.getElementById('clearFiles');
const classifyBatchBtn = document.getElementById('classifyBatchBtn');
const batchProcessingStatus = document.getElementById('batchProcessingStatus');
const currentFile = document.getElementById('currentFile');
const totalFiles = document.getElementById('totalFiles');
const batchResults = document.getElementById('batchResults');
const totalImages = document.getElementById('totalImages');
const bottleCount = document.getElementById('bottleCount');
const otherCount = document.getElementById('otherCount');
const avgConfidence = document.getElementById('avgConfidence');
const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
const downloadBatchResultsBtn = document.getElementById('downloadBatchResults');
const apiStatusIndicator = document.getElementById('apiStatusIndicator');
const apiResponseEl = document.getElementById('apiResponse');
const endpointTestButtons = document.querySelectorAll('.endpoint-test');

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// State
let selectedFiles = [];
let batchResultsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    setupNavigation();
    
    // Set up single image upload
    setupSingleImageUpload();
    
    // Set up batch upload
    setupBatchUpload();
    
    // Set up API status
    checkApiHealth();
    setupApiTesting();
});

// Navigation
function setupNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // If switching to API section, check health
            if (targetId === 'api') {
                checkApiHealth();
            }
        });
    });
}

// Single Image Upload
function setupSingleImageUpload() {
    // Upload area click handler
    singleUploadArea.addEventListener('click', () => {
        singleImageInput.click();
    });
    
    // File input change handler
    singleImageInput.addEventListener('change', handleSingleImageUpload);
    
    // Drag and drop
    singleUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        singleUploadArea.style.borderColor = '#00c853';
        singleUploadArea.style.backgroundColor = '#0f0f0f';
    });
    
    singleUploadArea.addEventListener('dragleave', () => {
        singleUploadArea.style.borderColor = '#333';
        singleUploadArea.style.backgroundColor = '#111';
    });
    
    singleUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        singleUploadArea.style.borderColor = '#333';
        singleUploadArea.style.backgroundColor = '#111';
        
        if (e.dataTransfer.files.length) {
            singleImageInput.files = e.dataTransfer.files;
            handleSingleImageUpload();
        }
    });
    
    // Remove image button
    removeImageBtn.addEventListener('click', clearSingleImage);
    
    // Classify button
    classifyBtn.addEventListener('click', classifySingleImage);
}

function handleSingleImageUpload() {
    const file = singleImageInput.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    // Create image preview
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Update preview
            previewImage.src = e.target.result;
            
            // Update file info
            fileName.textContent = file.name;
            imageDimensions.textContent = `${img.width} × ${img.height}px`;
            imageSize.textContent = formatFileSize(file.size);
            
            // Show preview container
            previewContainer.classList.remove('hidden');
            
            // Enable classify button
            classifyBtn.disabled = false;
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function clearSingleImage() {
    singleImageInput.value = '';
    previewImage.src = '';
    previewContainer.classList.add('hidden');
    classifyBtn.disabled = true;
    resultSection.classList.add('hidden');
}

async function classifySingleImage() {
    const file = singleImageInput.files[0];
    if (!file) return;
    
    // Show processing status
    classifyBtn.disabled = true;
    processingStatus.classList.remove('hidden');
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        // Send request to API
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Display results
        displaySingleResult(result);
        
    } catch (error) {
        console.error('Classification error:', error);
        alert('Failed to classify image. Please check API connection and try again.');
    } finally {
        // Reset button state
        classifyBtn.disabled = false;
        processingStatus.classList.add('hidden');
    }
}

function displaySingleResult(result) {
    const confidence = result.confidence;
    
    // Update values
    predictionValue.textContent = result.prediction.replace('_', ' ');
    confidenceValue.textContent = confidence.toFixed(2);
    
    // Update bottle status
    bottleStatus.textContent = result.is_water_bottle ? 'Yes' : 'No';
    bottleStatus.className = `result-value status ${result.is_water_bottle ? 'yes' : 'no'}`;
    
    // Update confidence meter
    meterFill.style.width = `${confidence}%`;
    meterPercentage.textContent = `${confidence.toFixed(2)}%`;
    
    // Update message
    messageText.textContent = result.message;
    
    // Show result section
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Batch Upload
function setupBatchUpload() {
    // Upload area click handler
    batchUploadArea.addEventListener('click', () => {
        batchImagesInput.click();
    });
    
    // File input change handler
    batchImagesInput.addEventListener('change', handleBatchImagesUpload);
    
    // Drag and drop
    batchUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        batchUploadArea.style.borderColor = '#00c853';
        batchUploadArea.style.backgroundColor = '#0f0f0f';
    });
    
    batchUploadArea.addEventListener('dragleave', () => {
        batchUploadArea.style.borderColor = '#333';
        batchUploadArea.style.backgroundColor = '#111';
    });
    
    batchUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        batchUploadArea.style.borderColor = '#333';
        batchUploadArea.style.backgroundColor = '#111';
        
        if (e.dataTransfer.files.length) {
            batchImagesInput.files = e.dataTransfer.files;
            handleBatchImagesUpload();
        }
    });
    
    // Clear files button
    clearFilesBtn.addEventListener('click', clearBatchFiles);
    
    // Classify batch button
    classifyBatchBtn.addEventListener('click', classifyBatchImages);
    
    // Download results button
    downloadBatchResultsBtn.addEventListener('click', downloadBatchResults);
}

function handleBatchImagesUpload() {
    const files = Array.from(batchImagesInput.files);
    
    // Validate file count
    if (files.length > 20) {
        alert('Maximum 20 images allowed per batch');
        return;
    }
    
    // Clear previous selection
    selectedFiles = [];
    fileList.innerHTML = '';
    
    // Process each file
    files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return; // Skip non-image files
        }
        
        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} exceeds 10MB limit and will be skipped`);
            return;
        }
        
        // Add to selected files
        selectedFiles.push(file);
        
        // Add to file list UI
        addFileToList(file);
    });
    
    // Update UI
    updateBatchUI();
}

function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.filename = file.name;
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas fa-image file-icon"></i>
            <div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
        </div>
        <button class="file-remove" data-filename="${file.name}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    fileList.appendChild(fileItem);
    
    // Add remove event listener
    const removeBtn = fileItem.querySelector('.file-remove');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFileFromList(file.name);
    });
}

function removeFileFromList(filename) {
    // Remove from selected files
    selectedFiles = selectedFiles.filter(file => file.name !== filename);
    
    // Remove from UI
    const fileItem = document.querySelector(`.file-item[data-filename="${filename}"]`);
    if (fileItem) {
        fileItem.remove();
    }
    
    // Update UI
    updateBatchUI();
}

function clearBatchFiles() {
    selectedFiles = [];
    fileList.innerHTML = '';
    batchImagesInput.value = '';
    batchResults.classList.add('hidden');
    updateBatchUI();
}

function updateBatchUI() {
    // Update file count
    const count = selectedFiles.length;
    fileCount.textContent = `${count} file${count !== 1 ? 's' : ''}`;
    
    // Show/hide file list
    if (count > 0) {
        fileListContainer.classList.remove('hidden');
        classifyBatchBtn.disabled = false;
    } else {
        fileListContainer.classList.add('hidden');
        classifyBatchBtn.disabled = true;
    }
}

async function classifyBatchImages() {
    if (selectedFiles.length === 0) return;
    
    // Show processing status
    classifyBatchBtn.disabled = true;
    batchProcessingStatus.classList.remove('hidden');
    currentFile.textContent = '0';
    totalFiles.textContent = selectedFiles.length;
    
    // Clear previous results
    batchResultsData = [];
    resultsTable.innerHTML = '';
    batchResults.classList.add('hidden');
    
    try {
        // Process each file
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Update progress
            currentFile.textContent = i + 1;
            
            try {
                // Create form data
                const formData = new FormData();
                formData.append('files', file);
                
                // Send request to API
                const response = await fetch(`${API_BASE_URL}/predict-batch`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const result = await response.json();
                
                // Process response
                if (result.predictions && result.predictions.length > 0) {
                    const prediction = result.predictions[0];
                    
                    // Store result
                    batchResultsData.push({
                        filename: file.name,
                        ...prediction
                    });
                    
                    // Add to results table
                    addResultToTable(file.name, prediction, i + 1);
                }
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                
                // Add error row
                const row = resultsTable.insertRow();
                row.innerHTML = `
                    <td>${file.name}</td>
                    <td colspan="4" class="red">Error: ${error.message}</td>
                `;
            }
        }
        
        // Update summary
        updateBatchSummary();
        
        // Show results
        batchResults.classList.remove('hidden');
        batchResults.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Batch classification error:', error);
        alert('Failed to classify images. Please check API connection and try again.');
    } finally {
        // Reset button state
        classifyBatchBtn.disabled = false;
        batchProcessingStatus.classList.add('hidden');
    }
}

function addResultToTable(filename, prediction, index) {
    const row = resultsTable.insertRow();
    
    row.innerHTML = `
        <td>${filename}</td>
        <td>${prediction.prediction.replace('_', ' ')}</td>
        <td>${prediction.confidence ? prediction.confidence.toFixed(2) + '%' : 'N/A'}</td>
        <td class="${prediction.is_water_bottle ? 'green' : ''}">${prediction.is_water_bottle ? 'Yes' : 'No'}</td>
        <td><span class="${prediction.error ? 'red' : 'green'}">${prediction.error ? 'Error' : 'Success'}</span></td>
    `;
}

function updateBatchSummary() {
    const total = batchResultsData.length;
    const bottles = batchResultsData.filter(r => r.is_water_bottle).length;
    const others = total - bottles;
    
    // Calculate average confidence
    let totalConfidence = 0;
    let countWithConfidence = 0;
    
    batchResultsData.forEach(r => {
        if (r.confidence) {
            totalConfidence += r.confidence;
            countWithConfidence++;
        }
    });
    
    const avgConf = countWithConfidence > 0 ? (totalConfidence / countWithConfidence) : 0;
    
    // Update UI
    totalImages.textContent = total;
    bottleCount.textContent = bottles;
    otherCount.textContent = others;
    avgConfidence.textContent = avgConf.toFixed(2) + '%';
}

function downloadBatchResults() {
    if (batchResultsData.length === 0) {
        alert('No results to download.');
        return;
    }
    
    // Create CSV content
    let csv = 'Filename,Prediction,Confidence,Water Bottle\n';
    
    batchResultsData.forEach(result => {
        csv += `${result.filename},${result.prediction},${result.confidence || 'N/A'},${result.is_water_bottle ? 'Yes' : 'No'}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water_bottle_classification_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// API Health Check
async function checkApiHealth() {
    const statusDot = apiStatusIndicator.querySelector('.status-dot');
    const statusText = apiStatusIndicator.querySelector('.status-text');
    
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        
        if (response.ok) {
            const data = await response.json();
            statusDot.classList.add('connected');
            statusDot.classList.remove('disconnected');
            statusText.textContent = data.model_loaded ? 'Model Loaded' : 'Ready (No Model)';
            statusText.style.color = '#00c853';
        } else {
            throw new Error(`Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Health check failed:', error);
        statusDot.classList.add('disconnected');
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';
        statusText.style.color = '#ff5252';
    }
}

// API Testing
function setupApiTesting() {
    endpointTestButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const endpoint = button.getAttribute('data-endpoint');
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;
            
            try {
                let response;
                
                if (endpoint === '/predict') {
                    // Test with sample image (if we had one)
                    apiResponseEl.textContent = 'This endpoint requires an image file. Use the Single Image section to test.';
                } else if (endpoint === '/predict-batch') {
                    apiResponseEl.textContent = 'This endpoint requires multiple image files. Use the Batch Upload section to test.';
                } else {
                    response = await fetch(`${API_BASE_URL}${endpoint}`);
                    const data = await response.json();
                    apiResponseEl.textContent = JSON.stringify(data, null, 2);
                }
                
            } catch (error) {
                apiResponseEl.textContent = `Error: ${error.message}`;
            } finally {
                button.innerHTML = 'Test';
                button.disabled = false;
            }
        });
    });
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}