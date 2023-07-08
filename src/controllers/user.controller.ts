import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models';
import {UserRepository} from '../repositories';

//@ts-ignore
const secretKey: jwt.Secret = process.env.SECRETKEY;
const tokenExpiryTime = process.env.TOKENEXPIRYTIME;

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/user/login')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
            },
            required: ['email', 'password'],
          },
        },
      },
    })
    credentials: {
      email: string;
      password: string;
    },
  ): Promise<{
    userInfo: {
      firstname: string;
      lastname: string;
      company: string;
      phone_number: string;
      email: string;
      // credentials: credentialsObj,
    };
    token: string;
  }> {
    const user = await this.userRepository.findOne({
      where: {email: credentials.email},
    });

    if (user) {
      const isMatch = await bcrypt.compare(credentials.password, user.password);

      if (isMatch) {
        // const credentialsObj = {
        //   amazon: {
        //     connected: user.credentials.amazon.connected,
        //   },
        //   google: {
        //     connected: user.credentials.google.connected,
        //   },
        //   facebook: {
        //     connected: user.credentials.facebook.connected,
        //   },
        // };

        const userInfo = {
          firstname: user.firstname,
          lastname: user.lastname,
          company: user.company,
          phone_number: user.phone_number,
          email: user.email,
          // credentials: credentialsObj,
        };

        const payload = {user: {id: user.customer_id}};
        const token = jwt.sign(payload, secretKey, {
          expiresIn: tokenExpiryTime,
        });
        //@ts-ignore
        return {userInfo, token};
      } else {
        throw new HttpErrors.Unauthorized('Invalid credentials');
      }
    } else {
      throw new HttpErrors.Unauthorized(
        'Not Registered. Please register to continue.',
      );
    }
  }

  @post('/user/register')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['customer_id'],
          }),
        },
      },
    })
    user: Omit<User, 'customer_id'>,
  ): Promise<{
    userInfo: {
      firstname: string;
      lastname: string;
      company: string;
      phone_number: string;
      email: string;
      // credentials: credentialsObj,
    };
    token: string;
  }> {
    console.log('user: ', user);

    const existingUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict(
        'User already exists. Please login to continue',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser = await this.userRepository.create({
      ...user,
      password: hashedPassword,
    });

    const payload = {user: {id: newUser.customer_id}};
    const token = jwt.sign(payload, secretKey, {expiresIn: tokenExpiryTime});

    // const credentialsObj = {
    //   amazon: {
    //     connected: newUser.credentials.amazon.connected,
    //   },
    //   google: {
    //     connected: newUser.credentials.google.connected,
    //   },
    //   facebook: {
    //     connected: newUser.credentials.facebook.connected,
    //   },
    // };

    const userInfo = {
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      company: newUser.company,
      phone_number: newUser.phone_number,
      email: newUser.email,
      // credentials: credentialsObj,
    };

    // this.userRepository.create(user);

    //@ts-ignore
    return {userInfo, token};
    // return user;
  }

  @get('/user/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/user')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  // @patch('/user')
  // @response(200, {
  //   description: 'User PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  @get('/user/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/user/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/user/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  // @del('/user/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
