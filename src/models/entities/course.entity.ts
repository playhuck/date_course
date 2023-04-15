import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
  
  @Entity()
  export class Course {

    @PrimaryGeneratedColumn('uuid')    
    course_uuid: string;
  
    @Column('varchar')
    course_title: string;
  
    @Column('varchar')
    course_context: string;

    @Column('varchar')
    course_date: string;

    @Column('varchar')
    userId : string;

    @Column('varchar')
    name : string;

  }
  