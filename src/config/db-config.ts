import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

// Extend DataSourceOptions to include the seeds property for typeorm-extension
interface ExtendedDataSourceOptions extends PostgresConnectionOptions {
  seeds?: string[];
}

const dataSourceOptions: ExtendedDataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  // console.log("DB_PASS:", process.env.DB_PASS); // DEBUG
  database: process.env.DB_NAME,
  schema: "public",
  migrationsRun: true,
  entities: [
    __dirname + "/../entities/*.entity.{js,ts}",
    __dirname + "/../**/entities/*.entity.{js,ts}",
  ],
  migrations: [__dirname + "/migrations/**/*.{js,ts}"],
  synchronize: false,
  migrationsTableName: "migrations",
  // logging: ["query", "error"],
  seeds: ["src/config/seed/**/*.{js,ts}"], // Path to seeder files
};

const AppDataSource = new DataSource(dataSourceOptions);



export default AppDataSource;