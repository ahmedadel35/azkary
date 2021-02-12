import { BaseEntity, EntityTarget, Repository } from 'typeorm';
import faker from 'faker';
import db, { TEST_DB_NAME } from '@/utils/db';

export default abstract class BaseFactory {
    protected faker = faker;
    protected size = 1;
    protected conName: string = TEST_DB_NAME;
    protected entity: EntityTarget<BaseEntity>;
    protected repo!: Repository<BaseEntity>;
    protected relationsSize!: number;

    public constructor(entity: EntityTarget<BaseEntity>) {
        this.entity = entity;
    }

    /**
     * set connection name
     * @param conName string
     */
    public setConName(conName: string): BaseFactory {
        this.conName = conName;
        return this;
    }

    /**
     * sets this entity repository
     * @param repo Repository<BaseEntity>
     */
    public setRepo(repo: Repository<BaseEntity>): BaseFactory {
        this.repo = repo;
        return this;
    }

    /**
     * add relations to every entity instance
     */
    public with(size: number = 3): BaseFactory {
        this.relationsSize = size;
        return this;
    }

    /**
     * create more than one user object
     * @param size number
     */
    public count(size = 1): BaseFactory {
        this.size = size;
        return this;
    }

    /**
     * create user object without saving it
     */
    public make(): BaseEntity | BaseEntity[] {
        const entities = [];
        for (let i = 0; i < this.size; i++) {
            entities.push(this.getData());
        }
        return entities.length > 1 ? entities : entities[0];
    }

    /**
     * save user object into database
     */
    public async create(
        entity: BaseEntity | null = null
    ): Promise<BaseEntity | BaseEntity[]> {
        const con = await db(this.conName);
        const repo = con.getRepository(this.entity);
        const entities: BaseEntity[] = [];
        for (let i = 0; i < this.size; i++) {
            entity = entity ?? this.getData();
            entity = this.relationsSize
                ? await this.addRelations(entity, repo)
                : await repo.save(entity);
            entities.push(entity);
        }
        return entities.length > 1 ? entities : entities[0];
    }

    /**
     * add relations to this entity instance and save it
     * @param entity BaseEntity
     * @param repo Repository<BaseEntity>
     */
    protected async addRelations(
        entity: BaseEntity,
        repo: Repository<BaseEntity>
    ): Promise<BaseEntity> {
        return await repo.save(entity);
    }

    /**
     * get entity columns
     */
    abstract getData(): BaseEntity;
}