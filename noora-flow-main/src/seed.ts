/**
 * Standalone seeding entry point: `npm run seed`.
 *
 * Runs outside the HTTP server so that a deployment can seed once, explicitly,
 * instead of racing several application replicas against each other on boot.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AdminSeederService } from './modules/seeders/admin-seeder.service';

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const adminSeeder = app.get(AdminSeederService);
    const { created, phoneNo } = await adminSeeder.seedAdmin();
    logger.log(
      created
        ? `Admin ${phoneNo} created.`
        : `Admin ${phoneNo} already present - nothing to do.`,
    );
  } finally {
    await app.close();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    new Logger('Seed').error(error?.message ?? error);
    process.exit(1);
  });
