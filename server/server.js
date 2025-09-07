import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "naveenmanagement"
});

// Test MySQL connection and create tables if they don't exist
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    console.log("🔧 Troubleshooting tips:");
    console.log("   1. Make sure XAMPP/WAMP MySQL service is running");
    console.log("   2. Check if database 'naveenmanagement' exists");
    console.log("   3. Verify MySQL root password (try empty string)");
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL Database: naveenmanagement");
    
    // Create tables if they don't exist
    createTablesIfNotExist();
  }
});

// Create necessary tables
function createTablesIfNotExist() {
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Create category table
  const createCategoryTable = `
    CREATE TABLE IF NOT EXISTS category (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Create student table
  const createStudentTable = `
    CREATE TABLE IF NOT EXISTS student (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20),
      date_of_birth DATE,
      category_id INT,
      address TEXT,
      enrollment_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
    )
  `;

  // Create product table
  const createProductTable = `
    CREATE TABLE IF NOT EXISTS product (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      stock INT DEFAULT 0,
      category_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
    )
  `;

  // Execute table creation queries
  db.query(createUsersTable, (err) => {
    if (err) console.error("Error creating users table:", err.message);
    else console.log("✅ Users table ready");
  });

  db.query(createCategoryTable, (err) => {
    if (err) console.error("Error creating category table:", err.message);
    else {
      console.log("✅ Category table ready");
      // Insert default categories if table is empty
      db.query("SELECT COUNT(*) as count FROM category", (err, result) => {
        if (!err && result[0].count === 0) {
          const insertCategories = `
            INSERT INTO category (name, description) VALUES 
            ('General', 'General category'),
            ('Technology', 'Technology related items'),
            ('Education', 'Education related items'),
            ('Health', 'Health and wellness')
          `;
          db.query(insertCategories, (err) => {
            if (!err) console.log("✅ Default categories inserted");
          });
        }
      });
    }
  });

  db.query(createStudentTable, (err) => {
    if (err) console.error("Error creating student table:", err.message);
    else console.log("✅ Student table ready");
  });

  db.query(createProductTable, (err) => {
    if (err) console.error("Error creating product table:", err.message);
    else console.log("✅ Product table ready");
  });
}

// Common HTML template function
function generateHTML(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                max-width: 1200px;
                margin: 0 auto;
            }
            table { 
                border-collapse: collapse; 
                width: 100%; 
                background: white;
                margin-top: 20px;
            }
            th { 
                background-color: #f8f9fa;
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #dee2e6;
                color: #495057;
            }
            td { 
                padding: 12px 15px;
                border-bottom: 1px solid #dee2e6;
                color: #212529;
            }
            tr:hover {
                background-color: #f8f9fa;
            }
            .btn { 
                padding: 8px 16px;
                margin-right: 5px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                display: inline-block;
                cursor: pointer;
                border: none;
                text-align: center;
            }
            .edit-btn { 
                background-color: #28a745;
                color: white;
                border: 1px solid #28a745;
            }
            .delete-btn { 
                background-color: #dc3545;
                color: white;
                border: 1px solid #dc3545;
            }
            .add-btn {
                background-color: #17a2b8;
                color: white;
                border: 1px solid #17a2b8;
                margin-bottom: 20px;
            }
            .btn:hover { 
                opacity: 0.9;
                transform: translateY(-1px);
                transition: all 0.2s;
            }
            .nav-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #dee2e6;
            }
            .nav-btn {
                background-color: #007bff;
                color: white;
                margin-right: 10px;
                margin-bottom: 5px;
            }
            .nav-btn.active {
                background-color: #0056b3;
            }
            .page-title {
                color: #495057;
                margin-bottom: 20px;
                font-size: 24px;
                font-weight: 600;
            }
            .stats {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                color: #6c757d;
            }
            .form-container {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #495057;
            }
            .form-group input, .form-group select, .form-group textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
                max-width: 300px;
                box-sizing: border-box;
            }
            .form-group textarea {
                min-height: 60px;
                resize: vertical;
            }
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
            }
            .form-row {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            .form-row .form-group {
                flex: 1;
                min-width: 200px;
            }
            .success-message {
                background-color: #d4edda;
                color: #155724;
                padding: 12px;
                border-radius: 4px;
                margin-bottom: 20px;
                border: 1px solid #c3e6cb;
            }
            .error-message {
                background-color: #f8d7da;
                color: #721c24;
                padding: 12px;
                border-radius: 4px;
                margin-bottom: 20px;
                border: 1px solid #f5c6cb;
            }
            .no-data {
                text-align: center;
                padding: 40px;
                color: #6c757d;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="page-title">Management System</h1>
            
            <div class="nav-section">
                <a href="/" class="btn nav-btn ${title === 'User Management' ? 'active' : ''}">Users</a>
                <a href="/students" class="btn nav-btn ${title === 'Student Management' ? 'active' : ''}">Students</a>
                <a href="/products" class="btn nav-btn ${title === 'Product Management' ? 'active' : ''}">Products</a>
                <a href="/categories" class="btn nav-btn ${title === 'Category Management' ? 'active' : ''}">Categories</a>
                <a href="/api/users" class="btn nav-btn">API</a>
                <a href="/health" class="btn nav-btn">Health</a>
            </div>
            
            ${content}
        </div>
    </body>
    </html>
  `;
}

// Home route - Users table
app.get("/", (req, res) => {
  const sql = "SELECT * FROM users ORDER BY id DESC";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Error: ", err);
      return res.status(500).send(`<h1>Error: ${err.message}</h1>`);
    }
    
    let tableContent = `
      <div class="stats">
        <strong>Total Users:</strong> ${data.length}
      </div>
      <a href="/add-user" class="btn add-btn">+ Add New User</a>
    `;
    
    if (data.length === 0) {
      tableContent += `<div class="no-data">No users found. Click "Add New User" to create one.</div>`;
    } else {
      tableContent += `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(user => {
        const created = user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A';
        tableContent += `
          <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${created}</td>
            <td>
              <a href="/edit-user/${user.id}" class="btn edit-btn">Edit</a>
              <a href="/delete-user/${user.id}" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this user?')">Delete</a>
            </td>
          </tr>
        `;
      });
      
      tableContent += `</tbody></table>`;
    }
    
    res.send(generateHTML('User Management', tableContent));
  });
});

// Add User Form
app.get("/add-user", (req, res) => {
  const formContent = `
    <h2>Add New User</h2>
    <div class="form-container">
      <form action="/add-user" method="POST">
        <div class="form-row">
          <div class="form-group">
            <label for="username">Username *:</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="email">Email *:</label>
            <input type="email" id="email" name="email" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="password">Password *:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone">
          </div>
        </div>
        <button type="submit" class="btn add-btn">Add User</button>
        <a href="/" class="btn nav-btn">Cancel</a>
      </form>
    </div>
  `;
  res.send(generateHTML('Add User', formContent));
});

// Handle Add User POST
app.post("/add-user", (req, res) => {
  const { username, email, password, phone } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    const errorContent = `
      <div class="error-message">Missing required fields: username, email, and password are required</div>
      <a href="/add-user" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }
  
  const sql = "INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [username, email, password, phone || null], (err, result) => {
    if (err) {
      console.error("MySQL Error: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'Username or email already exists';
      }
      const errorContent = `
        <div class="error-message">Error adding user: ${errorMsg}</div>
        <a href="/add-user" class="btn nav-btn">Try Again</a>
        <a href="/" class="btn nav-btn">Back to Users</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    const successContent = `
      <div class="success-message">User added successfully! ID: ${result.insertId}</div>
      <a href="/" class="btn nav-btn">Back to Users</a>
      <a href="/add-user" class="btn add-btn">Add Another User</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Edit User Form
app.get("/edit-user/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err, data) => {
    if (err || data.length === 0) {
      const errorContent = `
        <div class="error-message">User not found or error: ${err?.message || 'User not found'}</div>
        <a href="/" class="btn nav-btn">Back to Users</a>
      `;
      return res.status(404).send(generateHTML('Error', errorContent));
    }
    
    const user = data[0];
    const formContent = `
      <h2>Edit User - ${user.username}</h2>
      <div class="form-container">
        <form action="/edit-user/${userId}" method="POST">
          <div class="form-row">
            <div class="form-group">
              <label for="username">Username *:</label>
              <input type="text" id="username" name="username" value="${user.username}" required>
            </div>
            <div class="form-group">
              <label for="email">Email *:</label>
              <input type="email" id="email" name="email" value="${user.email}" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="password">New Password (leave empty to keep current):</label>
              <input type="password" id="password" name="password">
            </div>
            <div class="form-group">
              <label for="phone">Phone:</label>
              <input type="text" id="phone" name="phone" value="${user.phone || ''}">
            </div>
          </div>
          <button type="submit" class="btn edit-btn">Update User</button>
          <a href="/" class="btn nav-btn">Cancel</a>
        </form>
      </div>
    `;
    res.send(generateHTML('Edit User', formContent));
  });
});

// Handle Edit User POST
app.post("/edit-user/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email, password, phone } = req.body;
  
  if (!username || !email) {
    const errorContent = `
      <div class="error-message">Username and email are required</div>
      <a href="/edit-user/${userId}" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }
  
  let sql, params;
  if (password && password.trim() !== '') {
    sql = "UPDATE users SET username = ?, email = ?, password = ?, phone = ? WHERE id = ?";
    params = [username, email, password, phone || null, userId];
  } else {
    sql = "UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?";
    params = [username, email, phone || null, userId];
  }
  
  db.query(sql, params, (err) => {
    if (err) {
      console.error("MySQL Error: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'Username or email already exists';
      }
      const errorContent = `
        <div class="error-message">Error updating user: ${errorMsg}</div>
        <a href="/edit-user/${userId}" class="btn nav-btn">Try Again</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    const successContent = `
      <div class="success-message">User updated successfully!</div>
      <a href="/" class="btn nav-btn">Back to Users</a>
      <a href="/edit-user/${userId}" class="btn edit-btn">Edit Again</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Delete User
app.get("/delete-user/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("MySQL Error: ", err);
      const errorContent = `
        <div class="error-message">Error deleting user: ${err.message}</div>
        <a href="/" class="btn nav-btn">Back to Users</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    const successContent = `
      <div class="success-message">User deleted successfully!</div>
      <a href="/" class="btn nav-btn">Back to Users</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Students page
app.get("/students", (req, res) => {
  const sql = `
    SELECT s.*, c.name as category_name 
    FROM student s 
    LEFT JOIN category c ON s.category_id = c.id
    ORDER BY s.id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Error: ", err);
      return res.status(500).send(`<h1>Error: ${err.message}</h1>`);
    }
    
    let tableContent = `
      <div class="stats">
        <strong>Total Students:</strong> ${data.length}
      </div>
      <a href="/add-student" class="btn add-btn">+ Add New Student</a>
    `;
    
    if (data.length === 0) {
      tableContent += `<div class="no-data">No students found. Click "Add New Student" to create one.</div>`;
    } else {
      tableContent += `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(student => {
        const dob = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A';
        tableContent += `
          <tr>
            <td>${student.id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${dob}</td>
            <td>${student.category_name || 'N/A'}</td>
            <td>
              <a href="/edit-student/${student.id}" class="btn edit-btn">Edit</a>
              <a href="/delete-student/${student.id}" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this student?')">Delete</a>
            </td>
          </tr>
        `;
      });
      
      tableContent += `</tbody></table>`;
    }
    
    res.send(generateHTML('Student Management', tableContent));
  });
});

// Add Student Form
app.get("/add-student", (req, res) => {
  const categorySql = "SELECT * FROM category ORDER BY name";
  db.query(categorySql, (err, categories) => {
    if (err) {
      console.error("Category fetch error:", err);
      categories = [];
    }

    let categoryOptions = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      categoryOptions += `<option value="${cat.id}">${cat.name}</option>`;
    });
    
    const formContent = `
      <h2>Add New Student</h2>
      <div class="form-container">
        <form action="/add-student" method="POST">
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">First Name *:</label>
              <input type="text" id="first_name" name="first_name" required>
            </div>
            <div class="form-group">
              <label for="last_name">Last Name *:</label>
              <input type="text" id="last_name" name="last_name" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Phone:</label>
              <input type="text" id="phone" name="phone">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="date_of_birth">Date of Birth:</label>
              <input type="date" id="date_of_birth" name="date_of_birth">
            </div>
            <div class="form-group">
              <label for="category_id">Category:</label>
              <select id="category_id" name="category_id">
                ${categoryOptions}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="address">Address:</label>
            <textarea id="address" name="address" rows="3"></textarea>
          </div>
          <button type="submit" class="btn add-btn">Add Student</button>
          <a href="/students" class="btn nav-btn">Cancel</a>
        </form>
      </div>
    `;
    res.send(generateHTML('Add Student', formContent));
  });
});

// Handle Add Student POST
app.post("/add-student", (req, res) => {
  console.log("Add Student Request Body:", req.body);
  
  const { first_name, last_name, email, phone, date_of_birth, category_id, address } = req.body;
  
  // Validation
  if (!first_name || !last_name || !email) {
    const errorContent = `
      <div class="error-message">Missing required fields: First name, last name, and email are required</div>
      <a href="/add-student" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }
  
  const sql = `
    INSERT INTO student (first_name, last_name, email, phone, date_of_birth, category_id, address, enrollment_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
  `;
  
  const params = [
    first_name.trim(),
    last_name.trim(),
    email.trim(),
    phone ? phone.trim() : null,
    date_of_birth || null,
    category_id || null,
    address ? address.trim() : null
  ];
  
  console.log("SQL:", sql);
  console.log("Params:", params);
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("MySQL Error adding student: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'A student with this email already exists';
      }
      const errorContent = `
        <div class="error-message">Error adding student: ${errorMsg}</div>
        <a href="/add-student" class="btn nav-btn">Try Again</a>
        <a href="/students" class="btn nav-btn">Back to Students</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    console.log("Student added successfully, ID:", result.insertId);
    const successContent = `
      <div class="success-message">Student added successfully! ID: ${result.insertId}</div>
      <a href="/students" class="btn nav-btn">Back to Students</a>
      <a href="/add-student" class="btn add-btn">Add Another Student</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Edit Student Form
app.get("/edit-student/:id", (req, res) => {
  const studentId = req.params.id;

  const studentSql = `
    SELECT s.*, c.name AS category_name
    FROM student s
    LEFT JOIN category c ON s.category_id = c.id
    WHERE s.id = ?
  `;
  const categorySql = "SELECT * FROM category ORDER BY name";

  db.query(studentSql, [studentId], (err, studentRows) => {
    if (err || studentRows.length === 0) {
      const errorContent = `
        <div class="error-message">Student not found or error: ${err?.message || 'Student not found'}</div>
        <a href="/students" class="btn nav-btn">Back to Students</a>
      `;
      return res.status(404).send(generateHTML('Error', errorContent));
    }
    const student = studentRows[0];

    db.query(categorySql, (catErr, categories) => {
      if (catErr) {
        console.error("Category fetch error:", catErr);
        categories = [];
      }

      let categoryOptions = '<option value="">Select Category</option>';
      categories.forEach(cat => {
        const selected = student.category_id === cat.id ? 'selected' : '';
        categoryOptions += `<option value="${cat.id}" ${selected}>${cat.name}</option>`;
      });

      const dobValue = student.date_of_birth
        ? new Date(student.date_of_birth).toISOString().slice(0, 10)
        : '';

      const formContent = `
        <h2>Edit Student - ${student.first_name} ${student.last_name}</h2>
        <div class="form-container">
          <form action="/edit-student/${studentId}" method="POST">
            <div class="form-row">
              <div class="form-group">
                <label for="first_name">First Name *:</label>
                <input type="text" id="first_name" name="first_name" value="${student.first_name || ''}" required>
              </div>
              <div class="form-group">
                <label for="last_name">Last Name *:</label>
                <input type="text" id="last_name" name="last_name" value="${student.last_name || ''}" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email *:</label>
                <input type="email" id="email" name="email" value="${student.email || ''}" required>
              </div>
              <div class="form-group">
                <label for="phone">Phone:</label>
                <input type="text" id="phone" name="phone" value="${student.phone || ''}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="date_of_birth">Date of Birth:</label>
                <input type="date" id="date_of_birth" name="date_of_birth" value="${dobValue}">
              </div>
              <div class="form-group">
                <label for="category_id">Category:</label>
                <select id="category_id" name="category_id">
                  ${categoryOptions}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="address">Address:</label>
              <textarea id="address" name="address" rows="3">${student.address || ''}</textarea>
            </div>
            <button type="submit" class="btn edit-btn">Update Student</button>
            <a href="/students" class="btn nav-btn">Cancel</a>
          </form>
        </div>
      `;
      res.send(generateHTML('Edit Student', formContent));
    });
  });
});

// Handle Edit Student POST
app.post("/edit-student/:id", (req, res) => {
  const studentId = req.params.id;
  const { first_name, last_name, email, phone, date_of_birth, category_id, address } = req.body;

  if (!first_name || !last_name || !email) {
    const errorContent = `
      <div class="error-message">First name, last name, and email are required</div>
      <a href="/edit-student/${studentId}" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }

  const sql = `
    UPDATE student 
    SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, category_id = ?, address = ?
    WHERE id = ?
  `;
  const params = [
    first_name.trim(),
    last_name.trim(),
    email.trim(),
    phone ? phone.trim() : null,
    date_of_birth || null,
    category_id || null,
    address ? address.trim() : null,
    studentId
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("MySQL Error updating student: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'A student with this email already exists';
      }
      const errorContent = `
        <div class="error-message">Error updating student: ${errorMsg}</div>
        <a href="/edit-student/${studentId}" class="btn nav-btn">Try Again</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }

    const successContent = `
      <div class="success-message">Student updated successfully!</div>
      <a href="/students" class="btn nav-btn">Back to Students</a>
      <a href="/edit-student/${studentId}" class="btn edit-btn">Edit Again</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Delete Student
app.get("/delete-student/:id", (req, res) => {
  const studentId = req.params.id;
  const sql = "DELETE FROM student WHERE id = ?";
  
  db.query(sql, [studentId], (err) => {
    if (err) {
      console.error("MySQL Error: ", err);
      const errorContent = `
        <div class="error-message">Error deleting student: ${err.message}</div>
        <a href="/students" class="btn nav-btn">Back to Students</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    const successContent = `
      <div class="success-message">Student deleted successfully!</div>
      <a href="/students" class="btn nav-btn">Back to Students</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Products page
app.get("/products", (req, res) => {
  const sql = `
    SELECT p.*, c.name as category_name 
    FROM product p 
    LEFT JOIN category c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Error: ", err);
      return res.status(500).send(`<h1>Error: ${err.message}</h1>`);
    }

    let tableContent = `
      <div class="stats">
        <strong>Total Products:</strong> ${data.length}
      </div>
      <a href="/add-product" class="btn add-btn">+ Add New Product</a>
    `;

    if (data.length === 0) {
      tableContent += `<div class="no-data">No products found. Click "Add New Product" to create one.</div>`;
    } else {
      tableContent += `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style="text-align:right;">Price</th>
              <th>Category</th>
              <th style="text-align:right;">Stock</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(product => {
        const price = Number(product.price || 0);
        const priceStr = isNaN(price) ? '0.00' : price.toFixed(2);
        const stock = product.stock === null || product.stock === undefined ? '0' : product.stock;
        const created = product.created_at ? new Date(product.created_at).toLocaleString() : 'N/A';

        tableContent += `
          <tr>
            <td>${product.id}</td>
            <td>${product.name || 'Untitled'}</td>
            <td style="text-align:right;">${priceStr}</td>
            <td>${product.category_name || 'N/A'}</td>
            <td style="text-align:right;">${stock}</td>
            <td>${created}</td>
            <td>
              <a href="/edit-product/${product.id}" class="btn edit-btn">Edit</a>
              <a href="/delete-product/${product.id}" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this product?')">Delete</a>
            </td>
          </tr>
        `;
      });

      tableContent += `</tbody></table>`;
    }

    res.send(generateHTML('Product Management', tableContent));
  });
});

// Add Product Form
app.get("/add-product", (req, res) => {
  const categorySql = "SELECT * FROM category ORDER BY name";
  db.query(categorySql, (err, categories) => {
    if (err) {
      console.error("Category fetch error:", err);
      categories = [];
    }

    let categoryOptions = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      categoryOptions += `<option value="${cat.id}">${cat.name}</option>`;
    });

    const formContent = `
      <h2>Add New Product</h2>
      <div class="form-container">
        <form action="/add-product" method="POST">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Name *:</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="price">Price *:</label>
              <input type="number" step="0.01" min="0" id="price" name="price" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="stock">Stock:</label>
              <input type="number" min="0" id="stock" name="stock" value="0">
            </div>
            <div class="form-group">
              <label for="category_id">Category:</label>
              <select id="category_id" name="category_id">
                ${categoryOptions}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" name="description" rows="3"></textarea>
          </div>
          <button type="submit" class="btn add-btn">Add Product</button>
          <a href="/products" class="btn nav-btn">Cancel</a>
        </form>
      </div>
    `;
    res.send(generateHTML('Add Product', formContent));
  });
});

// Handle Add Product POST
app.post("/add-product", (req, res) => {
  console.log("Add Product Request Body:", req.body);
  
  const { name, price, stock, category_id, description } = req.body;
  
  // Validation
  if (!name || !price) {
    const errorContent = `
      <div class="error-message">Missing required fields: Name and price are required</div>
      <a href="/add-product" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    const errorContent = `
      <div class="error-message">Price must be a valid positive number</div>
      <a href="/add-product" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }
  
  const sql = `
    INSERT INTO product (name, price, stock, category_id, description)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    name.trim(),
    priceNum,
    stock ? parseInt(stock) : 0,
    category_id || null,
    description ? description.trim() : null
  ];

  console.log("SQL:", sql);
  console.log("Params:", params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("MySQL Error adding product: ", err);
      const errorContent = `
        <div class="error-message">Error adding product: ${err.message}</div>
        <a href="/add-product" class="btn nav-btn">Try Again</a>
        <a href="/products" class="btn nav-btn">Back to Products</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }

    console.log("Product added successfully, ID:", result.insertId);
    const successContent = `
      <div class="success-message">Product added successfully! ID: ${result.insertId}</div>
      <a href="/products" class="btn nav-btn">Back to Products</a>
      <a href="/add-product" class="btn add-btn">Add Another Product</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Edit Product Form
app.get("/edit-product/:id", (req, res) => {
  const productId = req.params.id;

  const productSql = `
    SELECT p.*, c.name AS category_name
    FROM product p
    LEFT JOIN category c ON p.category_id = c.id
    WHERE p.id = ?
  `;
  const categorySql = "SELECT * FROM category ORDER BY name";

  db.query(productSql, [productId], (err, prodRows) => {
    if (err || prodRows.length === 0) {
      const errorContent = `
        <div class="error-message">Product not found or error: ${err?.message || 'Product not found'}</div>
        <a href="/products" class="btn nav-btn">Back to Products</a>
      `;
      return res.status(404).send(generateHTML('Error', errorContent));
    }
    const product = prodRows[0];

    db.query(categorySql, (catErr, categories) => {
      if (catErr) {
        console.error("Category fetch error:", catErr);
        categories = [];
      }

      let categoryOptions = '<option value="">Select Category</option>';
      categories.forEach(cat => {
        const selected = product.category_id === cat.id ? 'selected' : '';
        categoryOptions += `<option value="${cat.id}" ${selected}>${cat.name}</option>`;
      });

      const formContent = `
        <h2>Edit Product - ${product.name}</h2>
        <div class="form-container">
          <form action="/edit-product/${productId}" method="POST">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name *:</label>
                <input type="text" id="name" name="name" value="${product.name || ''}" required>
              </div>
              <div class="form-group">
                <label for="price">Price *:</label>
                <input type="number" step="0.01" min="0" id="price" name="price" value="${product.price || 0}" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="stock">Stock:</label>
                <input type="number" min="0" id="stock" name="stock" value="${product.stock || 0}">
              </div>
              <div class="form-group">
                <label for="category_id">Category:</label>
                <select id="category_id" name="category_id">
                  ${categoryOptions}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="description">Description:</label>
              <textarea id="description" name="description" rows="3">$
                            <textarea id="description" name="description" rows="3">${product.description || ''}</textarea>
            </div>
            <button type="submit" class="btn edit-btn">Update Product</button>
            <a href="/products" class="btn nav-btn">Cancel</a>
          </form>
        </div>
      `;
      res.send(generateHTML('Edit Product', formContent));
    });
  });
});

// Handle Edit Product POST
app.post("/edit-product/:id", (req, res) => {
  const productId = req.params.id;
  const { name, price, stock, category_id, description } = req.body;

  if (!name || !price) {
    const errorContent = `
      <div class="error-message">Name and price are required</div>
      <a href="/edit-product/${productId}" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    const errorContent = `
      <div class="error-message">Price must be a valid positive number</div>
      <a href="/edit-product/${productId}" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }

  const sql = `
    UPDATE product 
    SET name = ?, price = ?, stock = ?, category_id = ?, description = ?
    WHERE id = ?
  `;
  const params = [
    name.trim(),
    priceNum,
    stock ? parseInt(stock) : 0,
    category_id || null,
    description ? description.trim() : null,
    productId
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("MySQL Error updating product: ", err);
      const errorContent = `
        <div class="error-message">Error updating product: ${err.message}</div>
        <a href="/edit-product/${productId}" class="btn nav-btn">Try Again</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }

    const successContent = `
      <div class="success-message">Product updated successfully!</div>
      <a href="/products" class="btn nav-btn">Back to Products</a>
      <a href="/edit-product/${productId}" class="btn edit-btn">Edit Again</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Delete Product
app.get("/delete-product/:id", (req, res) => {
  const productId = req.params.id;
  const sql = "DELETE FROM product WHERE id = ?";
  db.query(sql, [productId], (err) => {
    if (err) {
      console.error("MySQL Error: ", err);
      const errorContent = `
        <div class="error-message">Error deleting product: ${err.message}</div>
        <a href="/products" class="btn nav-btn">Back to Products</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    const successContent = `
      <div class="success-message">Product deleted successfully!</div>
      <a href="/products" class="btn nav-btn">Back to Products</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Categories page
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM category ORDER BY id DESC";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Error: ", err);
      return res.status(500).send(`<h1>Error: ${err.message}</h1>`);
    }
    
    let tableContent = `
      <div class="stats">
        <strong>Total Categories:</strong> ${data.length}
      </div>
      <a href="/add-category" class="btn add-btn">+ Add New Category</a>
    `;
    
    if (data.length === 0) {
      tableContent += `<div class="no-data">No categories found. Click "Add New Category" to create one.</div>`;
    } else {
      tableContent += `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(category => {
        const created = category.created_at ? new Date(category.created_at).toLocaleString() : 'N/A';
        tableContent += `
          <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || 'N/A'}</td>
            <td>${created}</td>
            <td>
              <a href="/edit-category/${category.id}" class="btn edit-btn">Edit</a>
              <a href="/delete-category/${category.id}" class="btn delete-btn" onclick="return confirm('Are you sure you want to delete this category?')">Delete</a>
            </td>
          </tr>
        `;
      });
      
      tableContent += `</tbody></table>`;
    }
    
    res.send(generateHTML('Category Management', tableContent));
  });
});

// Add Category Form
app.get("/add-category", (req, res) => {
  const formContent = `
    <h2>Add New Category</h2>
    <div class="form-container">
      <form action="/add-category" method="POST">
        <div class="form-group">
          <label for="name">Name *:</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" name="description" rows="3"></textarea>
        </div>
        <button type="submit" class="btn add-btn">Add Category</button>
        <a href="/categories" class="btn nav-btn">Cancel</a>
      </form>
    </div>
  `;
  res.send(generateHTML('Add Category', formContent));
});

// Handle Add Category POST
app.post("/add-category", (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    const errorContent = `
      <div class="error-message">Category name is required</div>
      <a href="/add-category" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }
  
  const sql = "INSERT INTO category (name, description) VALUES (?, ?)";
  
  db.query(sql, [name.trim(), description ? description.trim() : null], (err, result) => {
    if (err) {
      console.error("MySQL Error: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'Category name already exists';
      }
      const errorContent = `
        <div class="error-message">Error adding category: ${errorMsg}</div>
        <a href="/add-category" class="btn nav-btn">Try Again</a>
        <a href="/categories" class="btn nav-btn">Back to Categories</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }
    
    const successContent = `
      <div class="success-message">Category added successfully! ID: ${result.insertId}</div>
      <a href="/categories" class="btn nav-btn">Back to Categories</a>
      <a href="/add-category" class="btn add-btn">Add Another Category</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Edit Category Form
app.get("/edit-category/:id", (req, res) => {
  const categoryId = req.params.id;
  const sql = "SELECT * FROM category WHERE id = ?";

  db.query(sql, [categoryId], (err, rows) => {
    if (err || rows.length === 0) {
      const errorContent = `
        <div class="error-message">Category not found or error: ${err?.message || 'Category not found'}</div>
        <a href="/categories" class="btn nav-btn">Back to Categories</a>
      `;
      return res.status(404).send(generateHTML('Error', errorContent));
    }

    const category = rows[0];
    const formContent = `
      <h2>Edit Category - ${category.name}</h2>
      <div class="form-container">
        <form action="/edit-category/${categoryId}" method="POST">
          <div class="form-group">
            <label for="name">Name *:</label>
            <input type="text" id="name" name="name" value="${category.name}" required>
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" name="description" rows="3">${category.description || ''}</textarea>
          </div>
          <button type="submit" class="btn edit-btn">Update Category</button>
          <a href="/categories" class="btn nav-btn">Cancel</a>
        </form>
      </div>
    `;
    res.send(generateHTML('Edit Category', formContent));
  });
});

// Handle Edit Category POST
app.post("/edit-category/:id", (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;

  if (!name) {
    const errorContent = `
      <div class="error-message">Category name is required</div>
      <a href="/edit-category/${categoryId}" class="btn nav-btn">Try Again</a>
    `;
    return res.status(400).send(generateHTML('Error', errorContent));
  }

  const sql = `
    UPDATE category
    SET name = ?, description = ?
    WHERE id = ?
  `;
  const params = [name.trim(), description ? description.trim() : null, categoryId];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("MySQL Error updating category: ", err);
      let errorMsg = err.message;
      if (err.code === 'ER_DUP_ENTRY') {
        errorMsg = 'Category name already exists';
      }
      const errorContent = `
        <div class="error-message">Error updating category: ${errorMsg}</div>
        <a href="/edit-category/${categoryId}" class="btn nav-btn">Try Again</a>
      `;
      return res.status(500).send(generateHTML('Error', errorContent));
    }

    const successContent = `
      <div class="success-message">Category updated successfully!</div>
      <a href="/categories" class="btn nav-btn">Back to Categories</a>
      <a href="/edit-category/${categoryId}" class="btn edit-btn">Edit Again</a>
    `;
    res.send(generateHTML('Success', successContent));
  });
});

// Delete Category
app.get("/delete-category/:id", (req, res) => {
  const categoryId = req.params.id;

  // Optional: prevent delete if referenced (example simple check)
  const checkSql = "SELECT COUNT(*) AS cnt FROM product WHERE category_id = ? UNION ALL SELECT COUNT(*) AS cnt FROM student WHERE category_id = ?";
  db.query(checkSql, [categoryId, categoryId], (checkErr, rows) => {
    if (!checkErr && rows && rows.length === 2) {
      const referenced = (rows[0].cnt || 0) + (rows[1].cnt || 0);
      if (referenced > 0) {
        const errorContent = `
          <div class="error-message">Cannot delete category: It is referenced by products or students</div>
          <a href="/categories" class="btn nav-btn">Back to Categories</a>
        `;
        return res.status(400).send(generateHTML('Error', errorContent));
      }
    }

    const sql = "DELETE FROM category WHERE id = ?";
    db.query(sql, [categoryId], (err) => {
      if (err) {
        console.error("MySQL Error: ", err);
        const errorContent = `
          <div class="error-message">Error deleting category: ${err.message}</div>
          <a href="/categories" class="btn nav-btn">Back to Categories</a>
        `;
        return res.status(500).send(generateHTML('Error', errorContent));
      }
      const successContent = `
        <div class="success-message">Category deleted successfully!</div>
        <a href="/categories" class="btn nav-btn">Back to Categories</a>
      `;
      res.send(generateHTML('Success', successContent));
    });
  });
});

// JSON API endpoints
app.get("/api/users", (req, res) => {
  const sql = "SELECT id, username, email, phone, created_at FROM users";
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching users", error: err.message });
    }
    return res.json({ message: "Users fetched successfully", count: data.length, data: data });
  });
});

app.get("/api/students", (req, res) => {
  const sql = `
    SELECT s.*, c.name as category_name 
    FROM student s 
    LEFT JOIN category c ON s.category_id = c.id
    ORDER BY s.id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching students", error: err.message });
    }
    return res.json({ message: "Students fetched successfully", count: data.length, data: data });
  });
});

app.get("/api/products", (req, res) => {
  const sql = `
    SELECT p.*, c.name as category_name 
    FROM product p 
    LEFT JOIN category c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching products", error: err.message });
    }
    return res.json({ message: "Products fetched successfully", count: data.length, data: data });
  });
});

// ADDED: Categories API endpoint
app.get("/api/categories", (req, res) => {
  const sql = "SELECT * FROM category ORDER BY name";
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
    return res.json({ message: "Categories fetched successfully", count: data.length, data: data });
  });
});

// Health check
app.get("/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    const status = err ? "❌ Unhealthy" : "✅ Healthy";
    const dbStatus = err ? "Disconnected" : "Connected";
    const timestamp = new Date().toISOString();
    
    let healthContent = `
      <div class="stats">
        <h2>System Health Check</h2>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Database:</strong> ${dbStatus}</p>
        <p><strong>Server:</strong> Running</p>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        ${err ? `<p><strong>Error:</strong> ${err.message}</p>` : ''}
      </div>
      
      <div class="form-container">
        <h3>Test Database Operations</h3>
        <p>
          <a href="/api/users" class="btn nav-btn">Test Users API</a>
          <a href="/api/students" class="btn nav-btn">Test Students API</a>
          <a href="/api/products" class="btn nav-btn">Test Products API</a>
          <a href="/api/categories" class="btn nav-btn">Test Categories API</a>
        </p>
      </div>
    `;
    
    if (err) {
      return res.status(500).send(generateHTML('Health Check', healthContent));
    }
    return res.send(generateHTML('Health Check', healthContent));
  });
});

// 404 handler
app.use((req, res) => {
  const notFoundContent = `
    <div class="error-message">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
    <a href="/" class="btn nav-btn">Go Home</a>
  `;
  res.status(404).send(generateHTML('Page Not Found', notFoundContent));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const errorContent = `
    <div class="error-message">
      <h2>Internal Server Error</h2>
      <p>Something went wrong on our end.</p>
    </div>
    <a href="/" class="btn nav-btn">Go Home</a>
  `;
  res.status(500).send(generateHTML('Server Error', errorContent));
});

// ---------- Port selection with auto-retry ----------
function logEndpoints(port) {
  console.log(`\n✅ Server running on http://localhost:${port}`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   • http://localhost:${port}/ - Users Management`);
  console.log(`   • http://localhost:${port}/students - Students Management`);
  console.log(`   • http://localhost:${port}/products - Products Management`);
  console.log(`   • http://localhost:${port}/categories - Categories Management`);
  console.log(`   • http://localhost:${port}/health - Health Check`);
  console.log(`   • http://localhost:${port}/api/users - Users API`);
  console.log(`   • http://localhost:${port}/api/students - Students API`);
  console.log(`   • http://localhost:${port}/api/products - Products API`);
  console.log(`   • http://localhost:${port}/api/categories - Categories API\n`);
}

const BASE_PORT = Number(process.env.PORT) || 8800;
const MAX_TRIES = 10;

function startServer(tryPort, triesLeft) {
  const server = app.listen(tryPort, () => {
    logEndpoints(tryPort);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && triesLeft > 0) {
      const nextPort = tryPort + 1;
      console.warn(`⚠️ Port ${tryPort} in use. Trying ${nextPort}...`);
      setTimeout(() => startServer(nextPort, triesLeft - 1), 200);
    } else {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏳ Shutting down server...');
    server.close(() => {
      db.end(() => {
        console.log('❌ MySQL connection closed.');
        process.exit(0);
      });
    });
  });
}

startServer(BASE_PORT, MAX_TRIES);