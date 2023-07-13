import {repository} from '@loopback/repository';
import {
  HttpErrors,
  getModelSchemaRef,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Channels, User} from '../models';
import {ChannelsRepository, UserRepository} from '../repositories';
import {getChannelsList} from '../service/getChannelsList';

//@ts-ignore
const secretKey: jwt.Secret = process.env.SECRETKEY;
const tokenExpiryTime = process.env.TOKENEXPIRYTIME;

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
  ) {}

  @post('/user/login')
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
        //@ts-ignore
        const channels: Channels = await this.channelsRepository.findOne({
          where: {
            customer_id: user.customer_id,
          },
        });

        let userChannels = await getChannelsList(channels);

        const userInfo = {
          firstname: user.firstname,
          lastname: user.lastname,
          company: user.company,
          phone_number: user.phone_number,
          email: user.email,
          channels: userChannels,
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

    // Perform the transaction
    const tx = await this.userRepository.beginTransaction();
    console.log('transaction started');
    try {
      // Step 1: Insert a new record into the Users table
      const newUser = await this.userRepository.create(
        {
          ...user,
          password: hashedPassword,
        },
        {transaction: tx, autoGenerateId: true},
      );
      console.log('user created');
      console.log('newUser: ', newUser);

      // Step 2: Retrieve the generated customer_id
      const customer_id = newUser.customer_id;

      // Step 3: Insert a record into the Channels table using the retrieved customer_id
      await this.channelsRepository.create(
        {customer_id: customer_id},
        {transaction: tx, autoGenerateId: true},
      );
      console.log('channel created');

      const payload = {user: {id: newUser.customer_id}};
      const token = jwt.sign(payload, secretKey, {expiresIn: tokenExpiryTime});

      const userInfo = {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        company: newUser.company,
        phone_number: newUser.phone_number,
        email: newUser.email,
      };
      // Commit the transaction
      await tx.commit();

      // Transaction successful
      console.log('Transaction completed successfully.');

      //@ts-ignore
      return {userInfo, token};
    } catch (error) {
      // Rollback the transaction if any error occurs
      await tx.rollback();

      // Handle the error
      console.error('Error occurred during transaction:', error);

      throw new HttpErrors.InternalServerError(
        'Failed to create user. Transaction Failed',
      );
    }
  }

  // @get('/user/count')
  // @response(200, {
  //   description: 'User model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(@param.where(User) where?: Where<User>): Promise<Count> {
  //   return this.userRepository.count(where);
  // }

  // @get('/user')
  // @response(200, {
  //   description: 'Array of User model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(User, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
  //   return this.userRepository.find(filter);
  // }

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

  // @get('/user/{id}')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.number('id') id: number,
  //   @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  // ): Promise<User> {
  //   return this.userRepository.findById(id, filter);
  // }

  // @patch('/user/{id}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  // @put('/user/{id}')
  // @response(204, {
  //   description: 'User PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() user: User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }

  // @del('/user/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
