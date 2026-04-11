import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AdminEntity } from '../../admin/entities/admin.entity';
import { hashPassword } from '../../common/helper/auth.helper';

export default class AdminSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const repository = dataSource.getRepository(AdminEntity);

        const username = 'admin';
        const password = 'password123';

        const existingAdmin = await repository.findOne({ where: { username } });

        if (!existingAdmin) {
            const hashedPassword = await hashPassword(password, 10);

            const admin = repository.create({
                username,
                password: hashedPassword
            });

            await repository.save(admin);
            console.log(`\n================================`);
            console.log(`Admin seeded successfully.`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
            console.log(`================================\n`);
        } else {
            console.log(`\n================================`);
            console.log('Admin already exists. Skipping seeding.');
            console.log(`================================\n`);
        }
    }
}
