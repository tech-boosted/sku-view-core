import {HttpErrors} from '@loopback/rest';
import jwt from 'jsonwebtoken';
import {User} from '../models';
import {UserRepository} from '../repositories';

//@ts-ignore
const secretKey: jwt.Secret = process.env.SECRETKEY;

export const validateToken = async (
  token: string,
  userRepository: UserRepository,
) => {
  if (!token) {
    throw new HttpErrors.Forbidden('A token is required for authentication');
  }

  try {
    const userInfo = jwt.verify(token, secretKey);

    const selectedUser: User = await userRepository.findById(
      //@ts-ignore
      userInfo?.user?.id,
    );
    if (!selectedUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    return selectedUser;
  } catch (err) {
    throw new HttpErrors.Unauthorized('Invalid Token');
  }
};
