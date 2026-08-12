-- Doctor Medicine Information Portal - Sample Seed Data v2

USE doctor_medicine_portal;

-- Seed Doctor
INSERT INTO doctors (id, name, email, phone, password_hash, theme_preference, default_view, default_date_range, items_per_page, created_at) VALUES
(1, 'Dr. Aris Thorne', 'doctor@example.com', '+1-555-0192', '$2a$10$7R9mK9v8ZJ3.0hU2kZJ3.eX6wR1bU9Y7Z0V8ZJ3.0hU2kZJ3.eX6w', 'LIGHT', 'GRID', '7DAYS', 10, NOW()),
(2, 'Dr. Elena Rostova', 'elena.rostova@hospital.org', '+1-555-0841', '$2a$10$7R9mK9v8ZJ3.0hU2kZJ3.eX6wR1bU9Y7Z0V8ZJ3.0hU2kZJ3.eX6w', 'LIGHT', 'GRID', '7DAYS', 10, NOW());

-- Seed Companies
INSERT INTO companies (id, company_name, created_at) VALUES
(1, 'Sun Pharma', NOW()),
(2, 'Cipla', NOW()),
(3, 'Mankind Pharma', NOW()),
(4, 'Torrent Pharmaceuticals', NOW()),
(5, 'Lupin Limited', NOW()),
(6, 'Dr. Reddy\'s Laboratories', NOW());

-- Seed Medical Representatives
INSERT INTO medical_representatives (id, mr_name, contact_number, company_id, created_at) VALUES
(1, 'Rahul Sharma', '+91 98765 43210', 1, NOW()),
(2, 'Amit Kumar', '+91 98765 43211', 1, NOW()),
(3, 'Suman Das', '+91 98123 45678', 2, NOW()),
(4, 'Priya Verma', '+91 97890 12345', 3, NOW()),
(5, 'Vikram Mehta', '+91 99001 12233', 4, NOW()),
(6, 'Ananya Sen', '+91 98334 55667', 5, NOW()),
(7, 'Rohan Kapoor', '+91 91234 56789', 6, NOW());

-- Seed Medicines
INSERT INTO medicines (id, medicine_name, company_id, composition, description, created_at) VALUES
(1, 'Volini Gel 50g', 1, 'Diclofenac Diethylamine 1.16% w/w, Linseed Oil 3.0% w/w, Methyl Salicylate 10.0% w/w, Menthol 5.0% w/w', 'Topical analgesic and anti-inflammatory gel for joint pain, neck pain, and muscle sprains.', NOW()),
(2, 'Pantocid D SR', 1, 'Pantoprazole 40mg + Domperidone 30mg', 'Sustained release capsule used to treat gastroesophageal reflux disease (GERD) and acid peptic disorders.', NOW()),
(3, 'Ciplox 500', 2, 'Ciprofloxacin Hydrochloride 500mg', 'Broad-spectrum fluoroquinolone antibiotic prescribed for bacterial infections of respiratory tract, urinary tract, and skin.', NOW()),
(4, 'Foracort 200 Inhaler', 2, 'Budesonide 200mcg + Formoterol Fumarate 6mcg', 'Inhalation aerosol for maintenance treatment of asthma and chronic obstructive pulmonary disease (COPD).', NOW()),
(5, 'Manforce 50mg', 3, 'Sildenafil Citrate 50mg', 'Phosphodiesterase-5 (PDE-5) inhibitor indicated for erectile dysfunction treatment.', NOW()),
(6, 'Moxikind-CV 625', 3, 'Amoxicillin Trihydrate 500mg + Potassium Clavulanate 125mg', 'Beta-lactamase inhibitor combination antibiotic for resistant bacterial infections.', NOW()),
(7, 'Shelcal 500', 4, 'Calcium Carbonate 1250mg (equiv. Elemental Calcium 500mg) + Vitamin D3 250 IU', 'Bone health dietary supplement prescribed for osteoporosis, calcium deficiency, and pregnancy support.', NOW()),
(8, 'Nebistar 5', 4, 'Nebivolol Hydrochloride 5mg', 'Cardioselective beta-blocker indicated for essential hypertension and chronic heart failure management.', NOW()),
(9, 'Lupin-Amlodipine 5', 5, 'Amlodipine Besylate 5mg', 'Calcium channel blocker used to control high blood pressure and prevent angina attacks.', NOW()),
(10, 'Omez 20 Capsule', 6, 'Omeprazole 20mg', 'Proton pump inhibitor (PPI) that reduces gastric acid production for ulcer healing and heartburn relief.', NOW());

-- Seed Documents
INSERT INTO documents (id, doctor_id, file_name, stored_file_name, file_path, file_type, file_size, extracted_text, processing_status, upload_date, created_at) VALUES
(1, 1, 'SunPharma_Brochure_Aug2026.pdf', 'doc_20260812_001.pdf', 'uploads/doc_20260812_001.pdf', 'application/pdf', 1048576, 'Sun Pharma Medical Information Sheet. MR: Rahul Sharma (+91 98765 43210). Medicine: Volini Gel 50g. Composition: Diclofenac Diethylamine 1.16% w/w...', 'CONFIRMED', NOW(), NOW()),
(2, 1, 'Cipla_Respiratory_Guide.pdf', 'doc_20260812_002.pdf', 'uploads/doc_20260812_002.pdf', 'application/pdf', 2097152, 'Cipla Product Catalog. Representative: Suman Das (+91 98123 45678). Featured Products: Ciplox 500, Foracort 200 Inhaler.', 'CONFIRMED', NOW(), NOW()),
(3, 1, 'Mankind_AntiInfective_Detailer.png', 'doc_20260812_003.png', 'uploads/doc_20260812_003.png', 'image/png', 524288, 'Mankind Pharma. Representative: Priya Verma (+91 97890 12345). Moxikind-CV 625: Amoxicillin 500mg + Potassium Clavulanate 125mg.', 'CONFIRMED', NOW(), NOW());

-- Seed Medicine-Document Junction
INSERT INTO medicine_documents (id, medicine_id, document_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 2),
(4, 4, 2),
(5, 6, 3);

-- Seed Favorite MRs for Doctor 1
INSERT INTO doctor_favorite_mrs (id, doctor_id, mr_id, created_at) VALUES
(1, 1, 1, NOW()),
(2, 1, 3, NOW());
