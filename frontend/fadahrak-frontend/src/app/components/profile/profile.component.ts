/* Container */
.profile-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

/* Header */
.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.profile-header h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

/* Loading Spinner */
.loading-spinner {
  text-align: center;
  padding: 50px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Profile Image */
.profile-image-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.image-upload {
  margin-top: 10px;
}

.upload-btn {
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #218838;
}

/* Profile Details */
.profile-details {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-control[readonly] {
  background: #e9ecef;
  cursor: not-allowed;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-edit:hover {
  background: #218838;
}

.btn-save {
  background: #007bff;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #0056b3;
}

.btn-save:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-cancel:hover {
  background: #c82333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-container {
    margin: 10px;
    padding: 15px;
  }

  .profile-image {
    width: 100px;
    height: 100px;
  }

  .form-control {
    font-size: 14px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
