const inquirer = require('inquirer');
const mysql = require('mysql2');

//open connection to DB
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'webuser',
        password: 'r00tr00t!',
        database: 'employee_tracker_db'
    },
    console.log(`Connected to the database.`)
);

//retrieve department info from DB
const showDepartments = () => {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.error(err);
        }
        console.table(results);
        displayMenu();
    })
}

//retrieve role info from DB
const showRoles = () => {
    db.query(`SELECT role.title, role.salary, department.name as 'department name' FROM role JOIN department ON role.department_id=department.id;`, function (err, results) {
        if (err) {
            console.error(err);
        }
        console.table(results);
        displayMenu();
    })
}
//retrieve employee info from DB
const showEmployees = () => {
    db.query(`SELECT T1.first_name as 'first name', T1.last_name as 'last name', T3.title AS 'job title', CONCAT('$', FORMAT(T3.salary,2,'en_us')) AS salary, CONCAT(T2.first_name, ' ', T2.last_name) AS manager FROM employee_tracker_db.employee as T1 LEFT JOIN employee_tracker_db.employee as T2 ON T1.manager_id = T2.id INNER JOIN employee_tracker_db.role as T3 ON T1.role_id = T3.id;`, function (err, results) {
        if (err) {
            console.error(err);
        }
        console.table(results);
        //Does it get beyond?
        displayMenu();
    })
}
//add department to DB
const addDepartment = () => {
    let newDepartmentName;

    inquirer.prompt([{
        type: 'input',
        message: 'Enter new department name:',
        name: 'newDepartment',
    }]).then((answers) => {
        newDepartmentName = answers.newDepartment;
        console.log("NEW DEPT NAME:")
        console.log(newDepartmentName);
        db.query("INSERT INTO department (name) VALUES (?)", newDepartmentName, function (err, results) {
            if (err) {
                console.error(err);
            }
            console.log('ADDED NEW DEPARTMENT SUCCESSFULLY');
            displayMenu();
        })
    })


}
//add role to DB
const addRole = () => {
    let newTitle;
    let newSalary;

    //need to retrieve department IDs to fill choice field.

    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.error(err);
        }
        console.log("Logging Results");
        console.log(results);
        //create choices array with result data;
        let choice_Array = [];
        for (let i = 0; i < results.length; i++) {
            choice_Array.push(results[i].name);
        }

        inquirer.prompt([{
            type: 'input',
            message: 'Enter title for new role:',
            name: 'newTitle',
        }, {
            type: 'input',
            message: 'Enter salary for new role:',
            name: 'newSalary',
        }, {
            type: 'list',
            message: 'Set department for new role:',
            name: 'newDeptName',
            choices: choice_Array,
        }]).then((answers) => {
            newTitle = answers.newTitle;
            newSalary = answers.newSalary;
            newDeptName = answers.newDeptName;
            let newDeptId;
            //find the dept id
            for (let i = 0; i < results.length; i++) {
                if (results[i].name == newDeptName) {
                    newDeptId = results[i].id;
                }
            }

            db.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [newTitle, newSalary, newDeptId], function (err, results) {
                if (err) {
                    console.error(err);
                }
                console.log('ADDED NEW ROLE SUCCESSFULLY');
                displayMenu();
            })
        })


    })


}
//add employee to DB
const addEmployee = () => {
    let firstName = '';
    let lastName = '';
    let roleName = null;
    let managerName = null;

    //retrieve employee data to set as manager of new employee
    db.query("SELECT id, first_name, last_name FROM employee", function (err, results) {
        if (err) {
            console.error(err);
        }
        //create choices array with result data;
        let manager_choice_Array = ['N/A'];
        for (let i = 0; i < results.length; i++) {
            manager_choice_Array.push(`${results[i].first_name} ${results[i].last_name}`);
        }


        db.query("SELECT * FROM role", function (err2, results2) {
            if (err2) {

                console.error(err2);
            }
            let role_choice_array = [];
            for (let i = 0; i < results2.length; i++) {
                role_choice_array.push(results2[i].title);
            }

            inquirer.prompt([{
                type: 'input',
                message: 'Enter first name for new employee:',
                name: 'firstName',
            }, {
                type: 'input',
                message: 'Enter last name for new employee:',
                name: 'lastName',
            }, {
                type: 'list',
                message: 'Select role for new employee:',
                name: 'roleId',
                choices: role_choice_array,
            }, {
                type: 'list',
                message: 'Select manager for new employee (select N/A if no manager):',
                name: 'managerId',
                choices: manager_choice_Array,
            }]).then((answers) => {
                firstName = answers.firstName;
                lastName = answers.lastName;
                roleName = answers.roleId;
                managerName = answers.managerId;
                let newManagerId;
                for (let i = 0; i < results.length; i++) {
                    //create matched name
                    let newManager = `${results[i].first_name} ${results[i].last_name}`
                    if (newManager == managerName) {
                        newManagerId = results[i].id;
                    }
                }
                let newRoleId;
                for (let j = 0; j < results2.length; j++) {
                    if (roleName == results2[j].title) {
                        newRoleId = results2[j].id;
                    }
                }

                db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [firstName, lastName, newRoleId, newManagerId], function (err, results) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('ADDED NEW EMPLOYEE SUCCESSFULLY');
                    displayMenu();
                })
            })
        });

    })
}

//update employee role
const updateEmployeeRole = () => {
    //retrieve employees from DB
    db.query(`SELECT T1.id, T1.first_name, T1.last_name, T2.title FROM employee_tracker_db.employee as T1 JOIN employee_tracker_db.role as T2 ON T1.role_id = T2.id;`, function (err, result) {
        if (err) {
            console.error(err);
        }
        let employee_choice_array = []
        for (let i = 0; i < result.length; i++) {
            employee_choice_array.push(`${result[i].first_name} ${result[i].last_name} - ${result[i].title}`);
        }


        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Select employee to update:',
                    name: 'currentEmployee',
                    choices: employee_choice_array,
                },
            ]).then((answers) => {


                console.log('Employee to update:')
                console.log(answers.currentEmployee);
                //get ID
                let foundEmployeeID;
                for (let j = 0; j < result.length; j++) {
                    if (answers.currentEmployee == `${result[j].first_name} ${result[j].last_name} - ${result[j].title}`) {
                        foundEmployeeID = result[j].id;
                    }
                }

                //Get the roles to select a new one.
                db.query(`SELECT role.id, role.title, role.salary, department.name as 'department' FROM employee_tracker_db.role JOIN employee_tracker_db.department ON role.department_id = employee_tracker_db.department.id;`, function (err2, result2) {
                    if (err2) {
                        console.error(err2);
                    }
                    let role_choice_array = [];
                    for (let k = 0; k < result2.length; k++) {
                        role_choice_array.push({
                            name: `${result2[k].id}. ${result2[k].title} - ${result2[k].department}`,
                            value: result2[k].id
                        }
                        )
                    }
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'Select new role for employee:',
                                name: 'newRole',
                                choices: role_choice_array,
                            },
                        ]).then((answers) => {
                            console.log('Employee to Update:')
                            console.log(foundEmployeeID);
                            console.log('New Role to update to:');
                            console.log(answers.newRole);

                            //update the picked user with the picked role.
                            db.query(`UPDATE employee_tracker_db.employee SET employee.role_id = ? WHERE employee.id = ?;
                            `, [answers.newRole, foundEmployeeID], function (err3, result3) {
                                if (err3) {
                                    console.error(err3);
                                }

                                console.log('UPDATED EMPLOYEE SUCCESSFULLY');
                                displayMenu();
                            })
                        })
                })
            })
    })


}

const quit = () => {
    db.end((err, result) => {
        err ? console.error(err) : console.log('Successfully closed DB connection');
    })
    console.log(`***************************************`);
    console.log(`*******       Logging Off       *******`);
    console.log(`***************************************`);
    process.exit(1);

}

const displayMenu = () => {
    inquirer
        .prompt([
            {
                type: 'rawlist',
                message: 'Select Action:',
                name: 'action',
                choices: [
                    'view all departments',
                    'view all roles',
                    'view all employees',
                    'add a department',
                    'add a role',
                    'add an employee',
                    'update an employee role',
                    'quit',
                ]
            },
        ])
        .then((answers) => {
            console.log(answers.action);
            if (answers.action == 'view all departments') {
                showDepartments();
            }
            else if (answers.action == 'view all roles') {
                showRoles();
            }
            else if (answers.action == 'view all employees') {
                showEmployees();
            }
            else if (answers.action == 'add a department') {
                addDepartment();
            }
            else if (answers.action == 'add a role') {
                addRole();
            }
            else if (answers.action == 'add an employee') {
                addEmployee();
            }
            else if (answers.action == 'update an employee role') {
                updateEmployeeRole();
            }
            else if (answers.action == 'quit') {
                quit();
            }
        })
        .catch((err) => {
            //log error
            console.log(`***************************************`);
            console.log(`******      ERROR INCIDENT       ******`);
            console.log(`***************************************`);
            console.error(err);
        });
}
//Start CLI
function init() {

    console.log(`***************************************`);
    console.log(`*****      Employee Tracker       *****`);
    console.log(`***************************************`);
    displayMenu();
}

init();