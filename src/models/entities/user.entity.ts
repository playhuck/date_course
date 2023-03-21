import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
  
  @Entity()
  export class User {

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column('varchar')
    userId: string;
  
    @Column('varchar')
    name : string;

    @Column('varchar')
    password: string;

  }
  