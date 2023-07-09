// //@ts-ignore
// const secretKey: jwt.Secret = process.env.SECRETKEY;

// import { inject } from '@loopback/core';
// import { Request, Response, NextFunction } from 'express';
// import { Middleware, MiddlewareBindings } from '@loopback/express';

// export class CustomAuthMiddlewareProvider implements Provider<Middleware> {
//   constructor() {}

//   value(): Middleware {
//     return this.middleware.bind(this);
//   }

//   middleware(
//     req: Request,
//     res: Response,
//     next: NextFunction,
//     middlewareChain: MiddlewareChain,
//   ): void {
//     const token = req.headers.authorization;

//     if (!token) {
//       res.status(403).json({ message: 'A token is required for authentication' });
//       return;
//     }

//     try {
//       const decoded = jwt.verify(token, secretKey);
//       req.user = decoded;
//       req.token = token;

//       // Call the next middleware or controller method
//       next();
//     } catch (err) {
//       res.status(401).json({ message: 'Invalid Token' });
//     }
//   }
// }
