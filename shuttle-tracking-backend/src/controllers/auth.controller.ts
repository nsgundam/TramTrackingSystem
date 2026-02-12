import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // find user in database by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // compare password with hashed password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getme = async (req: Request, res: Response): Promise<void> => {
  try{
    const userData = req.user;

    const user = await prisma.user.findUnique({
      where: { id: (userData as any).userId },
      select: {
        id: true,
        username: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } 

    res.json({ user });
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}