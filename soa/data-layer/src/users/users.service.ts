import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {InjectEntityManager} from "@nestjs/typeorm";
import {EntityManager} from "typeorm";
import { Answer } from 'src/answer/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';

@Injectable()
export class UsersService {
  constructor(@InjectEntityManager() private manager: EntityManager) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.manager.create(User, createUserDto);
    return this.manager.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.manager.find(User);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.manager.findOne(User, id);
    if(!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.manager.transaction( async manager => {
      const user = await manager.findOne(User, id);
      if (!user) throw new NotFoundException(`User #${id} not found`);
      manager.merge(User, user, updateUserDto);
      return manager.save(user);
    });
  }

  async remove(id: number): Promise<void>{
    return this.manager.transaction( async manager => {
      const user = await manager.findOne(User, id);
      if (!user) throw new NotFoundException(`User #${id} not found`);
      await manager.delete(User,id);
    });
  }

  //additional operations
  async findMyQuestions(userid: number): Promise<Question[]> {
    const user = await this.manager.findOne(User,userid,{ relations: ["questions"]});
    return user.questions;
  }

  async findMyAnswers(userid:number): Promise<Answer[]> {
    const user = await this.manager.findOne(User,userid,{relations:["answers"]});
    return user.answers;
  }
}