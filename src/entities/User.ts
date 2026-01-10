import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Unique } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ collection: 'user' })
export class User {

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  role!: 'user' | 'admin';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, email: string, password: string, role: 'user' | 'admin' = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
