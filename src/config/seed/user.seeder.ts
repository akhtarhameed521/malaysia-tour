import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { EmployeeEntity } from '../../entities/employee.entity';

export default class EmployeeSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const repository = dataSource.getRepository(EmployeeEntity);

        const employeesData = [
            { employeeId: 'EMP001', fullName: 'Ahmed Ali', email: 'ahmed.ali@example.com', phone: '0123456781' },
            { employeeId: 'EMP002', fullName: 'Siti Aminah', email: 'siti.aminah@example.com', phone: '0123456782' },
            { employeeId: 'EMP003', fullName: 'Tan Boon Hock', email: 'tan.boonhock@example.com', phone: '0123456783' },
            { employeeId: 'EMP004', fullName: 'Muthu Krishnan', email: 'muthu.krishnan@example.com', phone: '0123456784' },
            { employeeId: 'EMP005', fullName: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '0123456785' },
            { employeeId: 'EMP006', fullName: 'Lim Wei Ming', email: 'lim.weiming@example.com', phone: '0123456786' },
            { employeeId: 'EMP007', fullName: 'Nurul Huda', email: 'nurul.huda@example.com', phone: '0123456787' },
            { employeeId: 'EMP008', fullName: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '0123456788' },
            { employeeId: 'EMP009', fullName: 'Wong Siew Lan', email: 'wong.siewlan@example.com', phone: '0123456789' },
            { employeeId: 'EMP010', fullName: 'Zulkifli Hassan', email: 'zulkifli.hassan@example.com', phone: '0123456790' },
        ];

        for (const employeeData of employeesData) {
            const existingEmployee = await repository.findOne({ where: { employeeId: employeeData.employeeId } });

            if (!existingEmployee) {
                const employee = repository.create(employeeData);
                await repository.save(employee);
                console.log(`Employee ${employeeData.employeeId} seeded successfully.`);
            } else {
                console.log(`Employee ${employeeData.employeeId} already exists. Skipping.`);
            }
        }
    }
}
