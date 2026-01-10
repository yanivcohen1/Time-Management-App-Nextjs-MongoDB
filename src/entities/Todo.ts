import { Entity, ManyToOne, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { User } from './User';

export enum TodoStatus {
  BACKLOG = 'BACKLOG',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity({ collection: 'todo' })
export class Todo {

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  status: TodoStatus = TodoStatus.BACKLOG;

  @Property({ nullable: true })
  dueTime?: Date;

  @Property({ nullable: true })
  duration?: number;

  @ManyToOne(() => User)
  owner!: User;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(title: string, owner: User) {
    this.title = title;
    this.owner = owner;
  }
}
