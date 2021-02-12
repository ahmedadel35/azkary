import { User } from '../entities/User';
import { Connection, createConnection, getConnection } from 'typeorm';

export const TEST_DB_NAME = 'test';
export const APP_DB_NAME = 'default';

export default async function db(conName = APP_DB_NAME): Promise<Connection> {
    let con: Connection;

    try {
        con = getConnection(conName);
    } catch (e) {
        con = await createConnection({
            name: conName,
            type: 'sqljs',
            autoSave: true,
            location: 'browser',
            logging: ['error', 'query', 'schema'],
            synchronize: true,
            entities: [User],
        });
    }

    return con;
}