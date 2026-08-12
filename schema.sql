-- Doctor Medicine Information Portal - Database Schema v2

CREATE DATABASE IF NOT EXISTS doctor_medicine_portal;
USE doctor_medicine_portal;

-- Doctors Table (Updated with profile picture, theme preferences & settings)
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_path VARCHAR(500),
    theme_preference VARCHAR(20) DEFAULT 'LIGHT',
    default_view VARCHAR(20) DEFAULT 'GRID',
    default_date_range VARCHAR(20) DEFAULT '7DAYS',
    items_per_page INT DEFAULT 10,
    notifications_settings TEXT,
    reduce_motion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medical Representatives Table
CREATE TABLE IF NOT EXISTS medical_representatives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mr_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    company_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(255) NOT NULL,
    company_id BIGINT NOT NULL,
    composition TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    extracted_text LONGTEXT,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medicine-Document Junction Table
CREATE TABLE IF NOT EXISTS medicine_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_medicine_document (medicine_id, document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Doctor Favorite MRs Junction Table
CREATE TABLE IF NOT EXISTS doctor_favorite_mrs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    mr_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (mr_id) REFERENCES medical_representatives(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_mr_fav (doctor_id, mr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for fast searching and filtering
CREATE INDEX idx_medicine_name ON medicines(medicine_name);
CREATE INDEX idx_medicine_company ON medicines(company_id);
CREATE INDEX idx_medicine_created_at ON medicines(created_at);
CREATE INDEX idx_document_doctor ON documents(doctor_id);
CREATE INDEX idx_document_upload_date ON documents(upload_date);
CREATE INDEX idx_mr_company ON medical_representatives(company_id);
CREATE INDEX idx_mr_name ON medical_representatives(mr_name);
CREATE INDEX idx_fav_doctor ON doctor_favorite_mrs(doctor_id);
