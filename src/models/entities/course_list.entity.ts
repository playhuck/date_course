import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
  
  @Entity()
  export class Course_List {

    @PrimaryGeneratedColumn('uuid')
    course_uuid: string;
  
    @Column('int')
    longitude: number;
  
    @Column('int')
    latitude: number;

    @Column('varchar')
    title: string;

    @Column('int')
    order: number;


  }
  