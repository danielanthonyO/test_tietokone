import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export async function registerAndLogin(
  app: INestApplication,
  email: string,
  role: UserRole = UserRole.WORKER,
) {
  const password = 'password123';

  await request(app.getHttpServer()).post('/auth/register').send({
    email,
    password,
    role,
  }).expect(201);

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return {
    token: loginResponse.body.access_token as string,
    password,
  };
}
