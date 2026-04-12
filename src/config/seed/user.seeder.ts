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
            // Group-01
            {
                employeeId: 'EMP001',
                fullName: 'Farid Iskandar',
                email: 'farid.iskandar@example.com',
                phone: '0123456781',
                group: { id: "1", name: "Group-01" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 137", departureDate: "10 May, 2026", departureTime: "17:00", departureCity: "Kuala Lumpur" },
                hotel: "Mandarin Oriental KL",
                room: { type: "sharing", number: "1204" },
                image: "",
                ticketImage: "",
                role: "SafetyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP002',
                fullName: 'Siti Aminah',
                email: 'siti.aminah@example.com',
                phone: '0123456782',
                group: { id: "1", name: "Group-01" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 137", departureDate: "10 May, 2026", departureTime: "17:00", departureCity: "Kuala Lumpur" },
                hotel: "Mandarin Oriental KL",
                room: { type: "sharing", number: "1204" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP003',
                fullName: 'Nurul Ain',
                email: 'nurul.ain@example.com',
                phone: '0123456783',
                group: { id: "1", name: "Group-01" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 137", departureDate: "10 May, 2026", departureTime: "17:00", departureCity: "Kuala Lumpur" },
                hotel: "Mandarin Oriental KL",
                room: { type: "sharing", number: "1206" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Malaysia"
            },
            {
                employeeId: 'EMP004',
                fullName: 'Ahmed Ali',
                email: 'ahmed.ali@example.com',
                phone: '0123456784',
                group: { id: "1", name: "Group-01" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 137", departureDate: "10 May, 2026", departureTime: "17:00", departureCity: "Kuala Lumpur" },
                hotel: "Mandarin Oriental KL",
                room: { type: "sharing", number: "1206" },
                image: "",
                ticketImage: "",
                role: "AgencyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP005',
                fullName: 'Raza Malik',
                email: 'raza.malik@example.com',
                phone: '0123456785',
                group: { id: "1", name: "Group-01" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 137", departureDate: "10 May, 2026", departureTime: "17:00", departureCity: "Kuala Lumpur" },
                hotel: "Mandarin Oriental KL",
                room: { type: "sharing", number: "1208" },
                image: "",
                ticketImage: "",
                role: "UnileverLead",
                country: "Pakistan"
            },

            // Group-02
            {
                employeeId: 'EMP006',
                fullName: 'Lim Wei Ming',
                email: 'lim.weiming@example.com',
                phone: '0123456786',
                group: { id: "2", name: "Group-02" },
                airline: { name: "Malaysia Airlines", details: "MH 123", departureDate: "02 May, 2026", departureTime: "09:00", departureCity: "Karachi" },
                returnAirline: { name: "Malaysia Airlines", details: "MH 124", departureDate: "10 May, 2026", departureTime: "18:00", departureCity: "Kuala Lumpur" },
                hotel: "Intercom",
                room: { type: "sharing", number: "201" },
                image: "",
                ticketImage: "",
                role: "SafetyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP007',
                fullName: 'Zulfiki Ali',
                email: 'zulkifli.hassan@example.com',
                phone: '0123456790',
                group: { id: "2", name: "Group-02" },
                airline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "10:00", departureCity: "Karachi" },
                returnAirline: { name: "Batik Airline", details: "OD 136", departureDate: "02 May, 2026", departureTime: "17:00", departureCity: "Kuala lampur" },
                hotel: "Intercom",
                room: { type: "sharing", number: "101" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP008',
                fullName: 'Sarah Johnson',
                email: 'sarah.johnson@example.com',
                phone: '0123456788',
                group: { id: "2", name: "Group-02" },
                airline: { name: "Malaysia Airlines", details: "MH 123", departureDate: "02 May, 2026", departureTime: "09:00", departureCity: "Karachi" },
                returnAirline: { name: "Malaysia Airlines", details: "MH 124", departureDate: "10 May, 2026", departureTime: "18:00", departureCity: "Kuala Lumpur" },
                hotel: "Intercom",
                room: { type: "sharing", number: "201" },
                image: "",
                ticketImage: "",
                role: "AgencyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP009',
                fullName: 'Wong Siew Lan',
                email: 'wong.siewlan@example.com',
                phone: '0123456789',
                group: { id: "2", name: "Group-02" },
                airline: { name: "Malaysia Airlines", details: "MH 123", departureDate: "02 May, 2026", departureTime: "09:00", departureCity: "Karachi" },
                returnAirline: { name: "Malaysia Airlines", details: "MH 124", departureDate: "10 May, 2026", departureTime: "18:00", departureCity: "Kuala Lumpur" },
                hotel: "Intercom",
                room: { type: "sharing", number: "202" },
                image: "",
                ticketImage: "",
                role: "UnileverLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP010',
                fullName: 'Muthu Krishnan',
                email: 'muthu.krishnan@example.com',
                phone: '0123456791',
                group: { id: "2", name: "Group-02" },
                airline: { name: "Malaysia Airlines", details: "MH 123", departureDate: "02 May, 2026", departureTime: "09:00", departureCity: "Karachi" },
                returnAirline: { name: "Malaysia Airlines", details: "MH 124", departureDate: "10 May, 2026", departureTime: "18:00", departureCity: "Kuala Lumpur" },
                hotel: "Intercom",
                room: { type: "sharing", number: "202" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Pakistan"
            },

            // Group-03
            {
                employeeId: 'EMP011',
                fullName: 'Rajesh Kumar',
                email: 'rajesh.kumar@example.com',
                phone: '0123456792',
                group: { id: "3", name: "Group-03" },
                airline: { name: "Emirates", details: "EK 600", departureDate: "02 May, 2026", departureTime: "03:00", departureCity: "Lahore" },
                returnAirline: { name: "Emirates", details: "EK 601", departureDate: "11 May, 2026", departureTime: "01:00", departureCity: "Kuala Lumpur" },
                hotel: "Grand Hyatt",
                room: { type: "single", number: "505" },
                image: "",
                ticketImage: "",
                role: "SafetyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP012',
                fullName: 'Hina Pervez',
                email: 'hina.pervez@example.com',
                phone: '0123456793',
                group: { id: "3", name: "Group-03" },
                airline: { name: "Emirates", details: "EK 600", departureDate: "02 May, 2026", departureTime: "03:00", departureCity: "Lahore" },
                returnAirline: { name: "Emirates", details: "EK 601", departureDate: "11 May, 2026", departureTime: "01:00", departureCity: "Kuala Lumpur" },
                hotel: "Grand Hyatt",
                room: { type: "single", number: "506" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP013',
                fullName: 'Ali Raza',
                email: 'ali.raza@example.com',
                phone: '0123456794',
                group: { id: "3", name: "Group-03" },
                airline: { name: "Emirates", details: "EK 600", departureDate: "02 May, 2026", departureTime: "03:00", departureCity: "Lahore" },
                returnAirline: { name: "Emirates", details: "EK 601", departureDate: "11 May, 2026", departureTime: "01:00", departureCity: "Kuala Lumpur" },
                hotel: "Grand Hyatt",
                room: { type: "single", number: "507" },
                image: "",
                ticketImage: "",
                role: "AgencyLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP014',
                fullName: 'Zainab Bibi',
                email: 'zainab.bibi@example.com',
                phone: '0123456795',
                group: { id: "3", name: "Group-03" },
                airline: { name: "Emirates", details: "EK 600", departureDate: "02 May, 2026", departureTime: "03:00", departureCity: "Lahore" },
                returnAirline: { name: "Emirates", details: "EK 601", departureDate: "11 May, 2026", departureTime: "01:00", departureCity: "Kuala Lumpur" },
                hotel: "Grand Hyatt",
                room: { type: "single", number: "508" },
                image: "",
                ticketImage: "",
                role: "UnileverLead",
                country: "Pakistan"
            },
            {
                employeeId: 'EMP015',
                fullName: 'Usman Ghani',
                email: 'usman.ghani@example.com',
                phone: '0123456796',
                group: { id: "3", name: "Group-03" },
                airline: { name: "Emirates", details: "EK 600", departureDate: "02 May, 2026", departureTime: "03:00", departureCity: "Lahore" },
                returnAirline: { name: "Emirates", details: "EK 601", departureDate: "11 May, 2026", departureTime: "01:00", departureCity: "Kuala Lumpur" },
                hotel: "Grand Hyatt",
                room: { type: "single", number: "509" },
                image: "",
                ticketImage: "",
                role: "Member",
                country: "Pakistan"
            }
        ];

        for (const employeeData of employeesData) {
            let employee = await repository.findOne({ where: { employeeId: employeeData.employeeId } });

            if (employee) {
                // Update existing employee with new data
                Object.assign(employee, employeeData);
                await repository.save(employee);
                console.log(`Employee ${employeeData.employeeId} updated successfully.`);
            } else {
                // Create new employee
                employee = repository.create(employeeData);
                await repository.save(employee);
                console.log(`Employee ${employeeData.employeeId} seeded successfully.`);
            }
        }
    }
}
