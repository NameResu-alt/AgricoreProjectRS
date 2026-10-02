TRUNCATE TABLE farms RESTART IDENTITY CASCADE;

INSERT INTO farms (name, location_region, capacity, supervisor_id) VALUES 
    ('FARM1', 'Location1', 100, 1),
    ('FARM2', 'Location2', 10, 2),
    ('FARM3', 'Location3', 500, 3);

INSERT INTO equipment (serial_number, model, status, fuel_level, facility_id) VALUES
    ('Serial1', 'Model1', 'In-Use', 32, 1),
    ('Serial2', 'Model2', 'Retired', 100, 2),
    ('Serial3', 'Model3', 'In-Use', 0, 1),
    ('Serial4', 'Model4', 'Idle', 50, 2),
    ('Serial5', 'Model5', 'Idle', 10, 3),
    ('Serial6', 'Model6', 'In-Use', 87, 3),
    ('Serial7', 'Model7', 'Maintenance', 77, 3);

INSERT INTO field_hands (name, facility_id) VALUES
    ('FieldHand1', 1),
    ('FieldHand2', 2),
    ('FieldHand3', 3);

INSERT INTO field_jobs (title, priority, status, equipment_id, operator_id) VALUES
    ('Title1', 'Medium', 'Pending', 1, 1),
    ('Title2', 'Medium', 'Pending', 2, 2),
    ('Title3', 'Low', 'Pending', 2, 1),
    ('Title4', 'Medium', 'In-Progress', 3, 1),
    ('Title5', 'Critical', 'Failed', 1, 3),
    ('Title6', 'Critical', 'Completed', 2, 2),
    ('Title7', 'Critical', 'Completed', 3, 3),
    ('Title7', 'Critical', 'In-Progress', 2, 2);

INSERT INTO service_reports (file_url, notes, field_job_id) VALUES
    ('S3URL1','Notes1', 1),
    ('S3URL2','Notes2', 2),
    ('S3URL3','Notes3', 3);
