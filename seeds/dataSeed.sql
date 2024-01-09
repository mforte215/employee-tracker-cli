USE employee_tracker_db;

INSERT INTO department (name) 
VALUES ("IT"), ("Finance"),("Marketing"),("Legal"),("Risk");


INSERT INTO role (title, salary, department_id)
VALUES ("Web Developer I",
90000,
1),
("Lawyer",
125000,
4),
("Cloud Engineer",
100000,
1),
("CEO",
10000000,
1),
("Social Media Manager",
90000,
3),
("Risk Manager",
100000,
5);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Mark", "Forte", 1, Null),
("Bill", "Gates", 1, 1),
("Albert", "Einstein", 1, Null),
("Dennis", "Ritchie", 1, 3),
("John", "Doe", 1, 2);
