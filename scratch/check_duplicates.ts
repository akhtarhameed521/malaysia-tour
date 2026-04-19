import AppDataSource from "./src/config/db-config";
import { EmployeeEntity } from "./src/entities/employee.entity";

async function checkDuplicates() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(EmployeeEntity);
    const employees = await repo.find();
    
    const idMap = new Map();
    const emailMap = new Map();
    
    console.log("Checking duplicates...");
    
    for (const e of employees) {
        if (e.employeeId) {
            if (idMap.has(e.employeeId)) {
                console.log(`Duplicate employeeId found: ${e.employeeId} on IDs ${idMap.get(e.employeeId)} and ${e.id}`);
            }
            idMap.set(e.employeeId, e.id);
        }
        if (e.email) {
            if (emailMap.has(e.email)) {
                console.log(`Duplicate email found: ${e.email} on IDs ${emailMap.get(e.email)} and ${e.id}`);
            }
            emailMap.set(e.email, e.id);
        }
    }
    
    await AppDataSource.destroy();
}

checkDuplicates();
