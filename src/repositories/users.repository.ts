import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { usersTable } from "../tables";
import type { User } from "../dtos/user.dto";

/* -------------------------------------------------------------------------- */
/*                                 Repository                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Repositories are the layer that interacts with the database. They are responsible for retrieving and
storing data. They should not contain any business logic, only database queries.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
 Repositories should only contain methods for CRUD operations and any other database interactions.
 Any complex logic should be delegated to a service. If a repository method requires a transaction,
 it should be passed in as an argument or the class should have a method to set the transaction.
 In our case the method 'trxHost' is used to set the transaction context.
*/

export type CreateUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<CreateUser>;

@injectable()
export class UsersRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async findAll(): Promise<User[]> {
		return this.db.query.usersTable.findMany();
	}

	async findOneById(id: string) {
		return this.db.query.usersTable.findFirst({
			where: eq(usersTable.id, id),
		});
	}

	async findOneByIdOrThrow(id: string) {
		const user = await this.findOneById(id);
		if (!user) throw Error("user-not-found");
		return user;
	}

	async findOneByEmail(email: string) {
		const user = this.db.query.usersTable.findFirst({
			where: eq(usersTable.email, email),
		});
		if (!user) throw Error("user-not-found");
		return user;
	}

	async findOneByUsername(username: string) {
		return this.db.query.usersTable.findFirst({
			where: eq(usersTable.username, username),
		});
	}

	async create(data: CreateUser) {
		return this.db
			.insert(usersTable)
			.values(data)
			.returning()
			.then(takeFirstOrThrow);
	}

	async update(id: string, data: UpdateUser) {
		return this.db
			.update(usersTable)
			.set(data)
			.where(eq(usersTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}

	async delete(userId: string) {
		return this.db.delete(usersTable).where(eq(usersTable.id, userId));
	}

	trxHost(trx: DatabaseProvider) {
		return new UsersRepository(trx);
	}
}
