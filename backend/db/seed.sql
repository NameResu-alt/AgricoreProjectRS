INSERT INTO farms (id, name, location_region, capacity, supervisor_id) VALUES 
    (1,'FARM1', 'Location1', 100, 1),
    (2,'FARM2', 'Location2', 10, 2),
    (3,'FARM3', 'Location3', 500, 3)
    ON CONFLICT
    DO NOTHING;

INSERT INTO equipment (id,serial_number, model, status, fuel_level, facility_id) VALUES
    (1,'Serial1', 'Model1', 'In-Use', 32, 1),
    (2,'Serial2', 'Model2', 'Retired', 100, 2),
    (3,'Serial3', 'Model3', 'In-Use', 0, 1),
    (4,'Serial4', 'Model4', 'Idle', 50, 2),
    (5,'Serial5', 'Model5', 'Idle', 10, 3),
    (6,'Serial6', 'Model6', 'In-Use', 87, 3),
    (7,'Serial7', 'Model7', 'Maintenance', 77, 3)
    ON CONFLICT
    DO NOTHING;

INSERT INTO field_hands (id,name, facility_id) VALUES
    (1,'FieldHand1', 1),
    (2,'FieldHand2', 2),
    (3,'FieldHand3', 3)
    ON CONFLICT
    DO NOTHING;

INSERT INTO field_jobs (id,title, priority, status, equipment_id, operator_id) VALUES
    (1,'Title1', 'Medium', 'Pending', 1, 1),
    (2,'Title2', 'Medium', 'Pending', 2, 2),
    (3,'Title3', 'Low', 'Pending', 2, 1),
    (4,'Title4', 'Medium', 'In-Progress', 3, 1),
    (5,'Title5', 'Critical', 'Failed', 1, 3),
    (6,'Title6', 'Critical', 'Completed', 2, 2),
    (7,'Title7', 'Critical', 'Completed', 3, 3),
    (8,'Title7', 'Critical', 'In-Progress', 2, 2)
    ON CONFLICT
    DO NOTHING;

INSERT INTO service_reports (id, file_url, notes, field_job_id) VALUES
    (1,'S3URL1','Notes1', 1),
    (2,'S3URL2','Notes2', 2),
    (3,'S3URL3','Notes3', 3)
    ON CONFLICT
    DO NOTHING;
